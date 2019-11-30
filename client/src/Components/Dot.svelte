<script>
  export let type;
</script>

<style>
  .dot {
    height: 0.5rem;
    width: 0.5rem;
    display: inline-block;
    border-radius: 9999px;
    margin-right: 0.25rem;
    vertical-align: middle;
  }

  .error-dot {
    background-color: #c53030;
  }

  .info-dot {
    background-color: #2b6cb0;
  }

  .warning-dot {
    background-color: #c05621;
  }

  .success-dot {
    background-color: #2f855a;
  }
</style>

<span class={`dot ${type}-dot`} />
