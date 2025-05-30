import { classNames } from '../classNames'

describe('classNames', () => {
  it('should return base class when no conditions are true', () => {
    const result = classNames('base', { conditional: false })
    expect(result).toBe('base')
  })

  it('should combine base class with conditional classes when conditions are true', () => {
    const result = classNames('base', {
      'conditional-1': true,
      'conditional-2': true,
      'conditional-3': false,
    })
    expect(result).toBe('base conditional-1 conditional-2')
  })

  it('should handle empty conditional classes object', () => {
    const result = classNames('base', {})
    expect(result).toBe('base')
  })

  it('should handle multiple true conditions', () => {
    const result = classNames('base', {
      active: true,
      selected: true,
      disabled: true,
    })
    expect(result).toBe('base active selected disabled')
  })
})
