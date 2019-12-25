<script>
  export let type;
  export let text;
</script>

<style>
  .tag {
    color: white;
    font-size: 0.9rem;
    font-weight: bold;
    border-radius: 0.25rem;
    display: inline-block;
    padding: 4px 7px;
    margin: 0px 6px;
  }

  .info {
    background-color: #4299e1;
  }

  .success {
    background-color: #48bb78;
  }

  .warning {
    background-color: #ed8936;
  }

  .error {
    background-color: #f56565;
  }

  .disabled {
    background-color: #a0aec0;
  }
</style>

<div class={`tag ${type}`}>{text}</div>
