import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddProduct from '../AddProduct';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('axios');

const mockNavigate = jest.fn();

let mockedId = undefined;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ id: mockedId }),
}));

const setMockedId = (id) => {
  mockedId = id;
};

beforeAll(() => {
  // Mock window.alert to avoid "not implemented" errors in tests
  window.alert = jest.fn();
});

describe('AddProduct Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setMockedId(undefined); // default to add mode
  });

  test('renders add product form correctly', () => {
    render(
      <MemoryRouter>
        <AddProduct />
      </MemoryRouter>
    );

    // Use getAllByText to handle multiple elements with "Add Product"
    const headings = screen.getAllByText(/add product/i);
    expect(headings.length).toBeGreaterThan(0);

    expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/price/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/image url/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/description/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
  });

  test('renders edit product form and fetches product data', async () => {
    setMockedId('123');

    const mockProduct = {
      title: 'Test Product',
      price: 100,
      description: 'Test description',
      imageUrl: 'http://example.com/image.jpg',
      category: 'Electronics',
    };

    axios.get.mockResolvedValueOnce({ data: mockProduct });

    render(
      <MemoryRouter initialEntries={['/products/edit/123']}>
        <Routes>
          <Route path="/products/edit/:id" element={<AddProduct />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/edit product/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByDisplayValue(mockProduct.title)).toBeInTheDocument();
      expect(screen.getByDisplayValue(String(mockProduct.price))).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockProduct.description)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockProduct.imageUrl)).toBeInTheDocument();
      expect(screen.getByDisplayValue(mockProduct.category)).toBeInTheDocument();
    });
  });

 


});
