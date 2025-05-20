import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReelsFeed from '../ReelsFeed';
import { server } from '../../mocks/server';

describe('ReelsFeed Component', () => {
  it('renders loading state initially', () => {
    render(<ReelsFeed />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders reels after loading', async () => {
    render(<ReelsFeed />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Check if reels are rendered
    const reels = await screen.findAllByRole('article');
    expect(reels.length).toBeGreaterThan(0);
  });

  it('handles like/unlike functionality', async () => {
    render(<ReelsFeed />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const likeButton = await screen.findByTestId('like-button');
    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByTestId('liked-icon')).toBeInTheDocument();
    });

    fireEvent.click(likeButton);

    await waitFor(() => {
      expect(screen.getByTestId('unliked-icon')).toBeInTheDocument();
    });
  });

  it('handles share functionality', async () => {
    const mockClipboard = {
      writeText: jest.fn(),
    };
    Object.assign(navigator, {
      clipboard: mockClipboard,
    });

    render(<ReelsFeed />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    const shareButton = await screen.findByTestId('share-button');
    fireEvent.click(shareButton);

    await waitFor(() => {
      expect(mockClipboard.writeText).toHaveBeenCalled();
    });
  });

  it('handles error state', async () => {
    server.use(
      rest.get('/api/reels', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<ReelsFeed />);
    
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch reels/i)).toBeInTheDocument();
    });
  });

  it('loads more reels on scroll', async () => {
    render(<ReelsFeed />);
    
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    });

    // Simulate scroll to bottom
    const observer = new IntersectionObserver(() => {});
    observer.observe(document.body);

    await waitFor(() => {
      expect(screen.getAllByRole('article').length).toBeGreaterThan(10);
    });
  });
}); 