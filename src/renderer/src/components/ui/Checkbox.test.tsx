import { render, screen, fireEvent } from '@testing-library/react';
import Checkbox from './checkbox';

describe('Checkbox component', () => {
  it('should render with the provided label', () => {
    render(
      <Checkbox
        label="Test Checkbox"
        checked={false}
        onChange={() => {}}
      />,
    );
    expect(screen.getByText('Test Checkbox')).toBeInTheDocument();
  });

  it('should call onChange when clicked', () => {
    const handleChange = jest.fn();
    render(
      <Checkbox
        label="Test Checkbox"
        checked={false}
        onChange={handleChange}
      />,
    );

    const checkbox = screen.getByLabelText('Test Checkbox');
    fireEvent.click(checkbox);

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith(true);
  });
});
