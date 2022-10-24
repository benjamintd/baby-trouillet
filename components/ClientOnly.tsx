import { FC, useState, useEffect, ReactNode } from "react";

const ClientOnly: FC<{ children: ReactNode }> = ({
  children,
  ...delegated
}) => {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <div {...delegated}>{children}</div>;
};

export default ClientOnly;
