import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

test('renders landing page heading', () => {
  render(<App />);
  expect(screen.getByText(/Know your impact/i)).toBeInTheDocument();
});

test('renders calculate button', () => {
  render(<App />);
  expect(screen.getByText(/Calculate my footprint/i)).toBeInTheDocument();
});

test('renders EcoTrace branding', () => {
  render(<App />);
  expect(screen.getByText(/EcoTrace/i)).toBeInTheDocument();
});

test('clicking calculate button navigates to calculator', async () => {
  render(<App />);
  const buttons = screen.getAllByText(/Calculate my footprint/i);
  await userEvent.click(buttons[0]);
  expect(screen.getByText(/How do you get around/i)).toBeInTheDocument();
});

test('calculator shows step 1 of 3 after navigation', async () => {
  render(<App />);
  const buttons = screen.getAllByText(/Calculate my footprint/i);
  await userEvent.click(buttons[0]);
  expect(screen.getByText(/STEP 1 OF 3/i)).toBeInTheDocument();
});
