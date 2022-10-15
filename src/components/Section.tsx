import React, { PropsWithChildren } from 'react'

export const Section: React.FC<PropsWithChildren> = ({ children }) => {
  return <section className='section'>{children}</section>
}
