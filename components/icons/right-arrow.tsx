export default function RightArrow(props: React.SVGProps<SVGSVGElement>) {
  const { width, height, color, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width || "32"}
      height={height || "32"}
      fill={color || "#000000"}
      viewBox="0 0 256 256"
      {...rest}
    >
      <path d="M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z"></path>
    </svg>
  );
}
