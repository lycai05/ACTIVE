import { defineComponent, resolveComponent, openBlock, createBlock, withCtx, createVNode, createElementBlock, unref, computed } from "vue";
import { S as SettingItemBox, D as DynamicComponent, u as useTrackStore } from "./index-ddbb72f1.mjs";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "SizeSetting",
  props: {
    chartAttr: {
      type: Object,
      required: true
    },
    isGroup: {
      type: Boolean,
      required: false
    }
  },
  setup(__props) {
    return (_ctx, _cache) => {
      const _component_n_input_number = resolveComponent("n-input-number");
      return openBlock(), createBlock(SettingItemBox, { name: "Height" }, {
        default: withCtx(() => [
          createVNode(_component_n_input_number, {
            value: __props.chartAttr.h,
            "onUpdate:value": _cache[0] || (_cache[0] = ($event) => __props.chartAttr.h = $event),
            min: __props.chartAttr.minHeight,
            max: __props.chartAttr.maxHeight,
            disabled: __props.isGroup,
            size: "small",
            placeholder: "px"
          }, null, 8, ["value", "min", "max", "disabled"])
        ]),
        _: 1
      });
    };
  }
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ChartSetting",
  setup(__props) {
    const useTargetData = () => {
      const trackStore2 = useTrackStore();
      const targetData2 = computed(() => {
        console.log(trackStore2.getTargetTrackInstance);
        return trackStore2.getTargetTrackInstance;
      });
      return { targetData: targetData2, trackStore: trackStore2 };
    };
    const { targetData, trackStore } = useTargetData();
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", null, [
        createVNode(_sfc_main$1, {
          isGroup: unref(targetData).isGroup,
          chartAttr: unref(targetData).attr
        }, null, 8, ["isGroup", "chartAttr"]),
        createVNode(DynamicComponent, {
          componentKey: unref(targetData).trackConfig.conKey,
          props: {
            optionData: unref(targetData).option
          }
        }, null, 8, ["componentKey", "props"])
      ]);
    };
  }
});
export {
  _sfc_main as default
};
