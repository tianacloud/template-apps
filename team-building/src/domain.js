export const uid = () => crypto.randomUUID();
export function newEvent(actor, fields = {}) {
  return {
    id: uid(),
    creatorId: actor.id,
    createdAt: new Date().toISOString(),
    title: "这周，一起好好吃顿饭",
    time: "",
    location: "",
    departure: "",
    notes: "",
    status: "active",
    voting: "open",
    mode: "single",
    maxChoices: 0,
    options: [],
    votes: {},
    people: { [actor.id]: actor },
    comments: [],
    history: [],
    finalOption: null,
    ...fields,
  };
}
export function copyEvent(source, actor) {
  return newEvent(actor, {
    title: `${source.title} · 副本`,
    time: source.time,
    location: source.location,
    departure: source.departure,
    notes: source.notes,
    mode: source.mode,
    maxChoices: source.maxChoices,
    options: source.options.map((o) => ({ ...o, id: uid() })),
  });
}
export function leaders(e) {
  const counts = e.options.map((o) => ({
    ...o,
    count: Object.values(e.votes).filter((v) => v.includes(o.id)).length,
  }));
  const max = Math.max(0, ...counts.map((o) => o.count));
  return counts.filter((o) => o.count === max);
}
export function changeEvent(source, actor, action) {
  if (source.status === "closed") throw new Error("活动已关闭，无法再修改。");
  const e = structuredClone(source);
  e.people[actor.id] = actor;
  let description = "";
  const option = () => {
    const o = e.options.find((o) => o.id === action.optionId);
    if (!o) throw new Error("餐厅选项已被移除，请刷新后查看。");
    return o;
  };
  const creator = () => {
    if (actor.id !== e.creatorId) throw new Error("请由活动创建者操作。");
  };
  switch (action.type) {
    case "edit": {
      const labels = {
        title: "活动名称",
        time: "聚餐时间",
        location: "集合地点",
        departure: "出发时间",
        notes: "注意事项",
      };
      const changes = [];
      for (const [key, value] of Object.entries(action.fields)) {
        if (key in labels && e[key] !== value) {
          changes.push(
            `${labels[key]}：${e[key] || "未填写"} → ${value || "未填写"}`,
          );
          e[key] = value;
        }
      }
      if (!e.title.trim()) throw new Error("请填写活动名称。");
      description = changes.join("；");
      break;
    }
    case "add-option":
      if (!action.name.trim()) throw new Error("请填写餐厅或套餐名称。");
      e.options.push({
        id: action.id || uid(),
        name: action.name.trim(),
        url: action.url.trim(),
        image: action.image || "",
      });
      description = `添加餐厅「${action.name.trim()}」`;
      break;
    case "edit-option": {
      const o = option();
      if (!action.name.trim()) throw new Error("请填写餐厅或套餐名称。");
      description = `修改餐厅「${o.name}」为「${action.name.trim()}」${o.url !== action.url ? "，更新链接" : ""}`;
      o.name = action.name.trim();
      o.url = action.url.trim();
      o.image = action.image || "";
      break;
    }
    case "remove-option": {
      const o = option();
      description = `移除餐厅「${o.name}」`;
      e.options = e.options.filter((o) => o.id !== action.optionId);
      for (const v of Object.values(e.votes)) {
        const i = v.indexOf(action.optionId);
        if (i >= 0) v.splice(i, 1);
      }
      break;
    }
    case "vote": {
      if (e.voting !== "open") throw new Error("投票已结束。");
      option();
      const v = e.votes[actor.id] || [];
      if (v.includes(action.optionId))
        e.votes[actor.id] = v.filter((id) => id !== action.optionId);
      else if (e.mode === "single") e.votes[actor.id] = [action.optionId];
      else {
        if (e.maxChoices > 0 && v.length >= e.maxChoices)
          throw new Error(`最多选择 ${e.maxChoices} 家餐厅。`);
        e.votes[actor.id] = [...v, action.optionId];
      }
      break;
    }
    case "settings": {
      if (e.voting !== "open") throw new Error("投票已结束。");
      const max = action.mode === "single" ? 1 : Number(action.maxChoices);
      if (Object.values(e.votes).some((v) => max > 0 && v.length > max))
        throw new Error("已有投票超过新上限，请保留当前规则。");
      e.mode = action.mode;
      e.maxChoices = action.mode === "single" ? 0 : max;
      description = `投票规则改为${e.mode === "single" ? "单选" : max > 0 ? `多选，最多 ${max} 项` : "多选，不限数量"}`;
      break;
    }
    case "finish": {
      creator();
      const o = option();
      description = `${e.voting === "ended" ? "更改" : "确定"}最终聚餐：「${o.name}」`;
      e.voting = "ended";
      e.finalOption = { ...o };
      break;
    }
    case "close":
      e.status = "closed";
      description = "关闭活动";
      break;
    case "comment":
      if (!action.text.trim()) throw new Error("先写点什么吧。");
      e.comments.push({
        id: uid(),
        userId: actor.id,
        text: action.text.trim(),
        mentions: action.mentions || [],
        createdAt: new Date().toISOString(),
      });
      break;
    default:
      throw new Error("未知操作。");
  }
  if (description)
    e.history.push({
      id: uid(),
      actor: { id: actor.id, name: actor.name },
      at: new Date().toISOString(),
      description,
    });
  return e;
}
export function parseShare(text) {
  const url = text.match(/https?:\/\/[^\s<>"，。；！）】]+/i)?.[0] || "";
  const bracket = text.match(/[【「『]([^】」』]+)[】」』]/)?.[1];
  const prefix = (url ? text.slice(0, text.indexOf(url)) : text)
    .replace(/(?:我发现|推荐|分享给你|大众点评)[：:\s]*/g, "")
    .trim();
  return {
    name: (bracket || prefix).replace(/^[\s,，:：]+|[\s,，:：]+$/g, ""),
    url,
  };
}
export function searchTerms(text) {
  return (text.toLocaleLowerCase().match(/[\p{L}\p{N}]/gu) || []).join(" ");
}
