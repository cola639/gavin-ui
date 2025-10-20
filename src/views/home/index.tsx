import { FC, useEffect } from 'react';

interface Iindex {}

const index: FC<Iindex> = () => {
  useEffect(() => {
    return () => {};
  }, []);

  const handleClick = () => {};

  return <div onClick={handleClick}>HOME</div>;
};

export default index;
