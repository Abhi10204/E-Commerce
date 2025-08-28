import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import '@testing-library/jest-dom';
import Products from '../Products';

jest.mock('axios');

beforeEach(() => {
  axios.get.mockResolvedValue({
    data: {
      products: [],
      totalPages: 1,
    },
  });
});

test('shows "No products found" when list is empty', async () => {
  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>
  );

  const noProductMessage = await screen.findByText(/no products found/i);
  expect(noProductMessage).toBeInTheDocument();
});

test('shows loading spinner while fetching products', async () => {
  let resolvePromise;
  const mockPromise = new Promise((resolve) => {
    resolvePromise = resolve;
  });

  axios.get.mockReturnValueOnce(mockPromise);

  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>
  );

  // Spinner should show initially
  expect(screen.getByRole('status')).toBeInTheDocument();

  // Resolve the axios request
  resolvePromise({
    data: {
      products: [],
      totalPages: 1,
    },
  });

  // Wait for spinner to disappear after loading
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

test('renders products correctly when fetched', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      products: [
        {
          _id: '1',
          title: 'Product One',
          price: 19.99,
          category: 'Category A',
          description: 'This is product one description.',
          imageUrl: 'http://example.com/image1.jpg',
          orderCount: 3,
        },
        {
          _id: '2',
          title: 'Product Two',
          price: 29.99,
          category: 'Category B',
          description: 'This is product two description.',
          imageUrl: 'http://example.com/image2.jpg',
          orderCount: 0,
        },
      ],
      totalPages: 1,
    },
  });

  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>
  );

  // Wait for product titles to appear
  const productOne = await screen.findByText('Product One');
  const productTwo = await screen.findByText('Product Two');

  expect(productOne).toBeInTheDocument();
  expect(productTwo).toBeInTheDocument();

  // Check product prices
  expect(screen.getByText('$19.99')).toBeInTheDocument();
  expect(screen.getByText('$29.99')).toBeInTheDocument();

  // Check categories
  expect(screen.getByText('Category A')).toBeInTheDocument();
  expect(screen.getByText('Category B')).toBeInTheDocument();

  // Check order count badge is visible only for product with orderCount > 0
  expect(screen.getByText('3 orders')).toBeInTheDocument();
  expect(screen.queryByText('0 orders')).not.toBeInTheDocument();

  // Check images have correct alt text
  expect(screen.getByAltText('Product One')).toBeInTheDocument();
  expect(screen.getByAltText('Product Two')).toBeInTheDocument();
});
