
import React from 'react';
import { render, screen, waitFor, fireEvent, getAllByRole } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Cart from '../Cart';
import axios from 'axios';
import '@testing-library/jest-dom';

jest.mock('axios');

// Renders empty cart message
test('shows "Your cart is empty" when localStorage has no items', async () => {
  localStorage.clear();
  localStorage.setItem('user', JSON.stringify({ id: '123' }));
  localStorage.setItem('authToken', 'mocktoken');
  localStorage.setItem('userCart_123', JSON.stringify([]));

  render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );

  const emptyMsg = await screen.findByText(/your cart is empty/i);
  expect(emptyMsg).toBeInTheDocument();
});


//Increments quantity on "+" click
test('increases quantity when "+" button is clicked', async () => {
  axios.get.mockResolvedValueOnce({
    data: {
      cart: {
        items: [
          {
            productId: {
              _id: 'prod1',
              name: 'Test Product',
              price: 10,
              imageUrl: '',
              description: '',
            },
            quantity: 1,
          },
        ],
      },
    },
  });

  localStorage.setItem('user', JSON.stringify({ id: '123' }));
  localStorage.setItem('authToken', 'mocktoken');

  render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );

  expect(await screen.findByText('Test Product')).toBeInTheDocument();

  const incrementButton = screen.getByRole('button', { name: '+' });
  fireEvent.click(incrementButton);

  await waitFor(() => {
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

//Remove item with trash icon
test('removes item from cart when trash icon is clicked', async () => {
  // Mock initial cart data
  axios.get.mockResolvedValueOnce({
    data: {
      cart: {
        items: [
          {
            productId: {
              _id: 'prod1',
              name: 'Test Product',
              price: 10,
              imageUrl: '',
              description: 'Test description',
            },
            quantity: 1,
          },
        ],
      },
    },
  });

  // Mock localStorage
  localStorage.setItem('user', JSON.stringify({ id: '123' }));
  localStorage.setItem('authToken', 'mockToken');

  render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );

  // Wait for the product to appear
  expect(await screen.findByText('Test Product')).toBeInTheDocument();

  // Click trash icon to remove the item
  const trashButton = screen.getByRole('button', { name: /remove item/i });
  fireEvent.click(trashButton);

  // Expect item to be removed from DOM
  await waitFor(() => {
    expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
  });
});

//Place order for selected items
test('places order for selected items only', async () => {
  // Mock cart API response
  axios.get.mockResolvedValueOnce({
    data: {
      cart: {
        items: [
          {
            productId: {
              _id: 'prod1',
              name: 'Product One',
              price: 25,
              imageUrl: '',
              description: '',
            },
            quantity: 2,
          },
          {
            productId: {
              _id: 'prod2',
              name: 'Product Two',
              price: 40,
              imageUrl: '',
              description: '',
            },
            quantity: 1,
          },
        ],
      },
    },
  });

  // Mock order placement API
  axios.post.mockResolvedValueOnce({}); // Mock successful order

  // Set up localStorage
  localStorage.setItem('user', JSON.stringify({ id: '123' }));
  localStorage.setItem('authToken', 'mockToken');

  render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );

  // Wait for cart items to appear
  expect(await screen.findByText('Product One')).toBeInTheDocument();
  expect(screen.getByText('Product Two')).toBeInTheDocument();

  // Select "Product One"
  const checkboxes = screen.getAllByRole('checkbox');
  fireEvent.click(checkboxes[0]); // Select first product only

  // Click "Place Selected Order" button
  const placeSelectedOrderBtn = screen.getByRole('button', { name: /place selected order/i });
  fireEvent.click(placeSelectedOrderBtn);

  // Wait for order API call to be made
  await waitFor(() => {
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/orders/placingOrder'),
      expect.objectContaining({
        userId: '123',
        products: [
          expect.objectContaining({
            productId: 'prod1',
            title: 'Product One',
            quantity: 2,
            price: 25,
          }),
        ],
      }),
      expect.any(Object)
    );
  });

  // Product One should be removed from cart
  await waitFor(() => {
    expect(screen.queryByText('Product One')).not.toBeInTheDocument();
    expect(screen.getByText('Product Two')).toBeInTheDocument();
  });
});


