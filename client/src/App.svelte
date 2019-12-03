<script>
  import Home from "./Routes/Home.svelte";
  import Account from "./Routes/Account.svelte";
  import Market from "./Routes/Market.svelte";
  import TranslationTool from "./Routes/TranslationTool.svelte";
  import Router from "svelte-spa-router";

  const routes = {
    "/": Home,
    "/account": Account,
    "/market": Market,
    "/translate": TranslationTool
  };
</script>

<Router {routes} />
