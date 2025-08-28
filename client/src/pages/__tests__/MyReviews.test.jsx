import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import MyReviews from '../MyReviews';
import { MemoryRouter } from 'react-router-dom';

jest.mock('axios');

test('shows loading spinner while fetching reviews', () => {
  axios.get.mockReturnValue(new Promise(() => {})); // pending promise

  render(
    <MemoryRouter>
      <MyReviews />
    </MemoryRouter>
  );

  expect(screen.getByRole('status')).toBeInTheDocument();
});


test('shows no reviews message and button when review list is empty', async () => {
  // Mock API to return empty array of reviews
  axios.get.mockResolvedValueOnce({ data: [] });

  render(
    <MemoryRouter>
      <MyReviews />
    </MemoryRouter>
  );

  // Wait for the loading spinner to disappear
  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  // Check the "no reviews" message is displayed
  expect(screen.getByText(/you haven't written any reviews yet/i)).toBeInTheDocument();

  // Check the "View Your Orders" button exists
  const ordersButton = screen.getByRole('button', { name: /view your orders/i });
  expect(ordersButton).toBeInTheDocument();
});

