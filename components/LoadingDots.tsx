import classNames from "classnames";

const LoadingDots: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <span
      className={classNames(
        className,
        "inline-flex items-center h-4 gap-2 leading-7 text-center"
      )}
    >
      <span className="w-2 h-2 bg-current rounded-full animate-bounce" />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce animation-delay-100" />
      <span className="w-2 h-2 bg-current rounded-full animate-bounce animation-delay-200" />
    </span>
  );
};

export default LoadingDots;
