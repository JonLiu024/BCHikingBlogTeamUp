import logo from "./logo.svg";
import "./App.css";
import { Button } from "@chakra-ui/react";
import { Route } from "react-router-dom/cjs/react-router-dom.min";
import Homepage from "./pages/Homepage";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <div className="App">
      <Route path="/" component={Homepage} exact />
      <Route path="/chat" component={ChatPage} />
      <Route></Route>
      <Route></Route>
    </div>
  );
}

export default App;
