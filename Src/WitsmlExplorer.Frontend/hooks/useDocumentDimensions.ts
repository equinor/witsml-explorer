import { useEffect, useState } from "react";

function getDocumentDimensions() {
  const { clientWidth: width, clientHeight: height } = document.documentElement;
  return {
    width,
    height
  };
}

export default function useDocumentDimensions() {
  const [documentDimensions, setDocumentDimensions] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    function handleResize() {
      setDocumentDimensions(getDocumentDimensions());
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return documentDimensions;
}
