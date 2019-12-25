<script>
  import Home from "./Routes/Home.svelte";
  import Account from "./Routes/Account.svelte";
  import Market from "./Routes/Market.svelte";
  import TranslationTool from "./Routes/TranslationTool.svelte";
  import CreateNewJob from "./Routes/CreateNewJob.svelte";
  import Router from "svelte-spa-router";
  import Navbar from "./Navbar/Navbar.svelte";
  import ConnectedServices from "./Components/ConnectedServices.svelte";

  const routes = {
    "/": Home,
    "/account": Account,
    "/market": Market,
    "/translate/:id?": TranslationTool,
    "/order": CreateNewJob
  };
</script>

<Navbar />
<Router {routes} />
<ConnectedServices />
