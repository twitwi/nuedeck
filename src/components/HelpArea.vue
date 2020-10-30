<template>
  <div class="help-area" @click="nd.$emit('toggleHelpArea')">
    <div class="help-area-content" @click.stop="">
      <h3>Help, Tools and Configuration</h3>
      <h4>
        <label>View Logs <input type="checkbox" v-model="viewLogs"/></label>
      </h4>
      <div class="view-logs" v-if="viewLogs">
        <span @click="copyContent('logspre')">(copy all){{ nl }}</span>
        <pre
          ref="logspre"
        ><span v-for="({date, section, data},i) in formattedLogs" :key="999999 - i"><span class="date">{{date}}</span> <span :class="'section-'+section">[{{ section }}] </span> <span>{{data}}</span>{{nl}}</span></pre>
      </div>
      <h4>Key bindings</h4>
      <div class="helpkeys">
        <div v-for="(v, k) in nd.opts.keys" :key="k"><span v-html="nd.NR.functionsDollarF.renderShortcut(k)"></span>: {{ k }}</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HelpArea',
  inject: { nd: 'nd' },
  props: {},
  data: () => ({
    viewLogs: false,
    nbsp: ' ',
    nl: `
`,
  }),
  computed: {
    formattedLogs() {
      let tzoffset = new Date().getTimezoneOffset() * 60000 // offset in milliseconds
      let localISOTime = d =>
        new Date(d - tzoffset)
          .toISOString()
          .slice(0, -1)
          .replace(/T/, ' @ ')

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
          data += ' ::: ' + JSON.stringify(l.data)
        }
        return {
          date: localISOTime(l.date.ms),
          section: l.section,
          data,
        }
      })
    },
  },
  methods: {
    copyContent(k) {
      navigator.clipboard.writeText(this.$refs[k].textContent)
    },
  },
}
</script>

<style scoped></style>
