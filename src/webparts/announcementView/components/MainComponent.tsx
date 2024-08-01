import * as React from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";

const MainComponent = () => {
  const { id } = useParams();
  useEffect(() => {
    // Retrieve the Id from the URL

    console.log(id, "id from announmentViewcomponent");
  }, [id]);

  return <div>hiiiiiii</div>;
};
export default MainComponent;
