<script>
  export let content;
  export let align;
</script>

<style>
  div {
    position: absolute;
    border-radius: 0.25rem;
    padding: 0.5rem;
    margin-top: 0.5rem;
    border: solid 1px #cbd5e0;
    font-size: 0.75rem;
    background-color: white;
    text-align: left;
    width: 100%;
  }

  p {
    margin: 0;
  }
</style>

<div style={align === 'right' ? 'margin-left: -30px' : 'margin-right: -30px'}>
  {#each content as line}
    <p>{line}</p>
  {/each}
</div>
