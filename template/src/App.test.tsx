import { render, screen } from '@testing-library/react';
import Home from './pages/Home';

test('renders learn decaf link', () => {
  render(<Home />);
  const linkElement = screen.getByText(/learn decaf/i);
  expect(linkElement).toBeInTheDocument();
});
