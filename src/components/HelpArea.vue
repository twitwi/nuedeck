<template>
  <div class="help-area">
    <h3>Help, Tools and Configuration</h3>
    <h4><label>View Logs <input type="checkbox" v-model="viewLogs"/></label></h4>
    <div class="view-logs" v-if="viewLogs">
      <pre><div v-for="({date, section, data},i) in formattedLogs" :key="999999 - i"><span class="date">{{date}}</span> <span :class="'section-'+section">[{{ section }}] </span> <span>{{data}}</span></div></pre>
    </div>
    <h4>Key bindings</h4>
    <div class="helpkeys">
      <div v-for="(v,k) in nd.opts.keys" :key="k">
        <span v-html="nd.NR.functionsDollarF.renderShortcut(k)"></span>: {{k}}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpArea',
  inject: {nd: 'nd'},
  props: {
  },
  data: () => ({
    viewLogs: false,
  }),
  computed: {
    formattedLogs () {
      let tzoffset = new Date().getTimezoneOffset() * 60000 // offset in milliseconds
      let localISOTime = d => new Date(d - tzoffset).toISOString().slice(0, -1).replace(/T/, ' @ ')

      return this.nd.logs.map(l => {
        let data = l.data
        let appendRaw = true
        if (l.section == 'change-slide') {
          data = `${data.from.slide}.${data.from.step} -> ${data.to.slide}.${data.to.step}`
        } else {
          data = JSON.stringify(data)
          appendRaw = false
        }
        if (appendRaw) {
          data += ' ::: '+JSON.stringify(l.data)
        }
        return {
          date: localISOTime(l.date.ms),
          section: l.section,
          data
        }})
    },
  },
}
</script>

<style scoped>
</style>
