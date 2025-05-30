export const classNames = (
  baseClass: string,
  conditionalClasses: { [key: string]: boolean }
): string => {
  const classes = [baseClass]

  Object.entries(conditionalClasses).forEach(([className, condition]) => {
    if (condition) {
      classes.push(className)
    }
  })

  return classes.join(' ')
}
