import Image from "next/image";
import Introduction from "./components/Introduction";
import Navbar from "./components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar></Navbar>
      <Introduction></Introduction>
    </div>
  );
}
