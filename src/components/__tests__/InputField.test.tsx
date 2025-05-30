import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { InputField } from '../InputField'

describe('InputField', () => {
  const mockOnClick = jest.fn()
  const mockInputRef = React.createRef<HTMLInputElement>()
  const defaultInputProps = {
    placeholder: 'Enter text',
    value: '',
    onChange: jest.fn(),
  }

  beforeEach(() => {
    mockOnClick.mockClear()
    defaultInputProps.onChange.mockClear()
  })

  it('renders input field with placeholder', () => {
    render(
      <InputField
        inputRef={mockInputRef}
        inputProps={defaultInputProps}
        onClick={mockOnClick}
        buttonLabel='Submit'
      />
    )
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
  })

  it('renders button with label', () => {
    render(
      <InputField
        inputRef={mockInputRef}
        inputProps={defaultInputProps}
        onClick={mockOnClick}
        buttonLabel='Submit'
      />
    )
    expect(screen.getByText('Submit')).toBeInTheDocument()
  })

  it('calls onClick when button is clicked', () => {
    render(
      <InputField
        inputRef={mockInputRef}
        inputProps={defaultInputProps}
        onClick={mockOnClick}
        buttonLabel='Submit'
      />
    )
    fireEvent.click(screen.getByText('Submit'))
    expect(mockOnClick).toHaveBeenCalledTimes(1)
  })

  it('calls onChange when input value changes', () => {
    render(
      <InputField
        inputRef={mockInputRef}
        inputProps={defaultInputProps}
        onClick={mockOnClick}
        buttonLabel='Submit'
      />
    )
    const input = screen.getByPlaceholderText('Enter text')
    fireEvent.change(input, { target: { value: 'new value' } })
    expect(defaultInputProps.onChange).toHaveBeenCalled()
  })

  it('applies correct classes to input and button', () => {
    render(
      <InputField
        inputRef={mockInputRef}
        inputProps={defaultInputProps}
        onClick={mockOnClick}
        buttonLabel='Submit'
      />
    )
    expect(screen.getByPlaceholderText('Enter text')).toHaveClass(
      'input',
      'is-primary'
    )
    expect(screen.getByText('Submit')).toHaveClass('button', 'is-primary')
  })

  it('forwards input props to input element', () => {
    const customProps = {
      ...defaultInputProps,
      maxLength: 10,
      required: true,
    }
    render(
      <InputField
        inputRef={mockInputRef}
        inputProps={customProps}
        onClick={mockOnClick}
        buttonLabel='Submit'
      />
    )
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toHaveAttribute('maxLength', '10')
    expect(input).toHaveAttribute('required')
  })
})
