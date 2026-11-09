"use client";

import PostForm from "./PostForm";
import Loading from "./Loading";
import { useBoard } from "./BoardProvider";

// wait for the browser so the form can prefill your saved ZIP and name
export default function PostView() {
  const { ready } = useBoard();
  return <div>{ready ? <PostForm /> : <Loading count={1} />}</div>;
}
