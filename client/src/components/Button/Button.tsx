import React from 'react';

import styles from './Button.module.css';
import classNames from 'classnames';

interface Props extends React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {
  text: string;
  mode?: 'secondary';
}

export const Button = (props: Props) => {
  const { text, mode, ...restProps } = props;

  return (
    <button
      {...restProps}
      className={classNames(styles.btn, { [styles.btnSecondary]: mode === 'secondary' })}
    >
      {text}
    </button>
  );
};