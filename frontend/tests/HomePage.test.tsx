import { describe, it, expect } from 'vitest';
import { render, screen } from './test-utils';
import { HomePage } from '../src/pages/HomePage';

describe('HomePage', () => {
  it('renders the landing page hero title', () => {
    render(<HomePage />);
    expect(screen.getByText('Discover Amazing Landmarks')).toBeInTheDocument();
  });

  it('renders call-to-action buttons', () => {
    render(<HomePage />);
    expect(screen.getByText('Start Exploring')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  it('renders feature cards', () => {
    render(<HomePage />);
    expect(screen.getByText('Interactive Map')).toBeInTheDocument();
  });
});
