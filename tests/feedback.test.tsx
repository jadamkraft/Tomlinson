import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import FeedbackModal from '../components/FeedbackModal';

const formspree = vi.hoisted(() => ({ useForm: vi.fn(), handleSubmit: vi.fn() }));

vi.mock('@formspree/react', () => ({
  useForm: formspree.useForm,
  ValidationError: () => null,
}));

beforeEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useFakeTimers();
  formspree.handleSubmit.mockImplementation((event: React.FormEvent) => event.preventDefault());
  formspree.useForm.mockReturnValue([
    { submitting: false, succeeded: false, errors: null }, formspree.handleSubmit,
  ]);
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Feedback tests must not POST'); }));
});

afterEach(() => {
  cleanup();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  expect(fetch).not.toHaveBeenCalled();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('feedback SubmissionError-like method contract', () => {
  it('renders general errors and flattens all field error messages', () => {
    const errors = {
      getFormErrors: vi.fn(() => [{ code: 'FORM_TEST', message: 'General test failure' }]),
      getAllFieldErrors: vi.fn(() => [
        ['email', [{ code: 'EMAIL_TEST', message: 'Email test failure' }]],
        ['message', [
          { code: 'MESSAGE_TEST', message: 'Message test failure' },
          { code: 'LENGTH_TEST', message: 'Message length test failure' },
        ]],
      ]),
    };
    formspree.useForm.mockReturnValue([
      { submitting: false, succeeded: false, errors }, formspree.handleSubmit,
    ]);
    render(<FeedbackModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Report a Bug / Feedback' })).toBeTruthy();
    expect(screen.getByText('General test failure')).toBeTruthy();
    expect(screen.getByText('Email test failure')).toBeTruthy();
    expect(screen.getByText('Message test failure')).toBeTruthy();
    expect(screen.getByText('Message length test failure')).toBeTruthy();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
    expect(errors.getFormErrors).toHaveBeenCalledTimes(1);
    expect(errors.getAllFieldErrors).toHaveBeenCalledTimes(1);
  });

  it('renders safely when errors are null', () => {
    render(<FeedbackModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.queryByText(/Couldn.t send your message/)).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
    expect(screen.getByRole('button', { name: 'Send' })).toBeTruthy();
  });

  it('does not show an error summary for empty error-method results', () => {
    formspree.useForm.mockReturnValue([
      { submitting: false, succeeded: false, errors: {
        getFormErrors: () => [], getAllFieldErrors: () => [],
      } }, formspree.handleSubmit,
    ]);
    render(<FeedbackModal isOpen={true} onClose={vi.fn()} />);
    expect(screen.queryByText(/Couldn.t send your message/)).toBeNull();
    expect(screen.queryByRole('list')).toBeNull();
  });

  it('renders nothing and does not inspect errors when closed', () => {
    const errors = { getFormErrors: vi.fn(), getAllFieldErrors: vi.fn() };
    formspree.useForm.mockReturnValue([
      { submitting: false, succeeded: false, errors }, formspree.handleSubmit,
    ]);
    const { container } = render(<FeedbackModal isOpen={false} onClose={vi.fn()} />);
    expect(container.childElementCount).toBe(0);
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(errors.getFormErrors).not.toHaveBeenCalled();
    expect(errors.getAllFieldErrors).not.toHaveBeenCalled();
  });

  it('submits only through a preventDefault mock, never the external service', () => {
    const { container } = render(<FeedbackModal isOpen={true} onClose={vi.fn()} />);
    const form = container.querySelector('form');
    expect(form).not.toBeNull();
    expect(fireEvent.submit(form!)).toBe(false);
    expect(formspree.handleSubmit).toHaveBeenCalledTimes(1);
    expect(fetch).not.toHaveBeenCalled();
  });
});