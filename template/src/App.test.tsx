import { render, screen } from '@testing-library/react';
import { RouterProvider, createMemoryRouter } from 'react-router-dom';
import { expect, test } from 'vitest';
import Home from './pages/Home';

test('renders learn decaf link', () => {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <Home />,
    },
  ]);
  render(<RouterProvider router={router} />);
  const linkElement = screen.getByText(/learn decaf/i);
  expect(linkElement).toBeInTheDocument();
});
