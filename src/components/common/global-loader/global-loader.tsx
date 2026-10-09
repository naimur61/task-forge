interface CustomStyle {
  "--c": string;
  background: string;
  backgroundSize: string;
  backgroundRepeat: string;
  animation: string;
}

const GlobalLoader = () => {
  return (
    <div className="flex justify-center items-center w-full h-screen bg-background">
      <div
        className="w-[56px] h-[56px]"
        style={
          {
            "--c": "radial-gradient(farthest-side, hsl(var(--primary)) 92%, transparent)",
            background: `
                  var(--c) 50% 0,
                  var(--c) 50% 100%,
                  var(--c) 100% 50%,
                  var(--c) 0 50%
              `,
            backgroundSize: "13.4px 13.4px",
            backgroundRepeat: "no-repeat",
            animation: "spinner-kh173p 1s infinite",
          } as CustomStyle
        }
      >
        <style>
          {`
          @keyframes spinner-kh173p {
            to {
              transform: rotate(0.5turn);
            }
          }
          `}
        </style>
      </div>
    </div>
  );
};

export default GlobalLoader;