<script>
  import Home from "./Routes/Home.svelte";
  import Account from "./Routes/Account.svelte";
  import Market from "./Routes/Market.svelte";
  import TranslationTool from "./Routes/TranslationTool.svelte";
  import CreateNewJob from "./Routes/CreateNewJob.svelte";
  import JobView from "./Routes/JobView.svelte";
  import About from "./Routes/About.svelte";
  import Router from "svelte-spa-router";
  import Navbar from "./Navbar/Navbar.svelte";
  import ConnectedServices from "./Components/ConnectedServices.svelte";

  const routes = {
    "/": Home,
    "/about": About,
    "/account": Account,
    "/market": Market,
    "/translate/:id?": TranslationTool,
    "/order": CreateNewJob,
    "/view/:id": JobView
  };
</script>

<Navbar />
<Router {routes} />
<ConnectedServices />
