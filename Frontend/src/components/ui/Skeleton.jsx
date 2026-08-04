import clsx from 'clsx';

export default function Skeleton({ className, ...rest }) {
  return <div className={clsx('skeleton', className)} {...rest} />;
}
