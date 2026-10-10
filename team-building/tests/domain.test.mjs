import test from "node:test";
import assert from "node:assert/strict";
import {
  newEvent,
  changeEvent,
  copyEvent,
  parseShare,
  leaders,
} from "../src/domain.js";
const owner = { id: "alice", name: "小禾" },
  member = { id: "bob", name: "小林" };
function event() {
  const e = newEvent(owner, { title: "周五聚餐" });
  e.options = [
    { id: "a", name: "山野小馆", url: "" },
    { id: "b", name: "海边食堂", url: "" },
  ];
  return e;
}
test("single choice replaces previous vote; multi choice observes configured maximum", () => {
  let e = event();
  e = changeEvent(e, member, { type: "vote", optionId: "a" });
  e = changeEvent(e, member, { type: "vote", optionId: "b" });
  assert.deepEqual(e.votes.bob, ["b"]);
  e = changeEvent(e, owner, {
    type: "settings",
    mode: "multiple",
    maxChoices: 1,
  });
  assert.throws(
    () => changeEvent(e, member, { type: "vote", optionId: "a" }),
    /最多/,
  );
  e = changeEvent(e, owner, {
    type: "settings",
    mode: "multiple",
    maxChoices: 0,
  });
  e = changeEvent(e, member, { type: "vote", optionId: "a" });
  assert.deepEqual(e.votes.bob, ["b", "a"]);
});
test("creator confirms tied result, can override and change venue after voting ends", () => {
  let e = event();
  e = changeEvent(e, owner, { type: "vote", optionId: "a" });
  e = changeEvent(e, member, { type: "vote", optionId: "b" });
  assert.equal(leaders(e).length, 2);
  assert.throws(
    () => changeEvent(e, member, { type: "finish", optionId: "a" }),
    /创建者/,
  );
  e = changeEvent(e, owner, { type: "finish", optionId: "a" });
  assert.throws(
    () => changeEvent(e, member, { type: "vote", optionId: "b" }),
    /投票已结束/,
  );
  e = changeEvent(e, owner, { type: "finish", optionId: "b" });
  assert.equal(e.finalOption.id, "b");
  assert.match(e.history.at(-1).description, /海边食堂/);
});
test("closed activity is immutable, copying keeps plan but resets participation", () => {
  let e = event();
  e = changeEvent(e, member, {
    type: "comment",
    text: "一起出发 @小禾",
    mentions: ["alice"],
  });
  e = changeEvent(e, member, { type: "vote", optionId: "a" });
  e = changeEvent(e, owner, { type: "close" });
  for (const action of [
    { type: "comment", text: "hi" },
    { type: "edit", fields: { location: "x" } },
    { type: "remove-option", optionId: "a" },
    { type: "vote", optionId: "a" },
  ])
    assert.throws(() => changeEvent(e, member, action), /已关闭/);
  const copy = copyEvent(e, member);
  assert.notEqual(copy.id, e.id);
  assert.equal(copy.status, "active");
  assert.deepEqual(copy.votes, {});
  assert.deepEqual(copy.comments, []);
  assert.equal(copy.options.length, 2);
  assert.notEqual(copy.options[0].id, e.options[0].id);
  assert.equal(copy.creatorId, "bob");
});
test("any participant edits candidates and logs edits; removing candidate removes its votes", () => {
  let e = event();
  e = changeEvent(e, owner, { type: "vote", optionId: "a" });
  e = changeEvent(e, member, {
    type: "edit-option",
    optionId: "a",
    name: "山野火锅",
    url: "https://example.com/menu",
  });
  assert.equal(e.options[0].name, "山野火锅");
  assert.equal(e.history.at(-1).actor.name, "小林");
  e = changeEvent(e, member, { type: "remove-option", optionId: "a" });
  assert.deepEqual(e.votes.alice, []);
});
test("Dianping share text yields title and URL without inventing titles", () => {
  assert.deepEqual(
    parseShare(
      "【山野小馆（滨江店）】双人套餐 https://m.dianping.com/shopshare/abc?shareid=1 复制打开大众点评",
    ),
    {
      name: "山野小馆（滨江店）",
      url: "https://m.dianping.com/shopshare/abc?shareid=1",
    },
  );
  assert.deepEqual(parseShare("https://dpurl.cn/abc"), {
    name: "",
    url: "https://dpurl.cn/abc",
  });
  assert.deepEqual(parseShare("周末四人欢聚套餐 https://dpurl.cn/abc"), {
    name: "周末四人欢聚套餐",
    url: "https://dpurl.cn/abc",
  });
});

test("confirmed venue remains the plan when someone removes its candidate", () => {
  let e = event();
  e = changeEvent(e, owner, { type: "finish", optionId: "a" });
  e = changeEvent(e, member, { type: "remove-option", optionId: "a" });
  assert.equal(e.finalOption.name, "山野小馆");
  assert.equal(e.voting, "ended");
});

test("restaurant preview image survives editing, copying and final selection", () => {
  let e = changeEvent(event(), owner, {
    type: "add-option",
    id: "photo",
    name: "有图的餐厅",
    url: "https://example.com/restaurant",
    image: "https://example.com/photo.jpg",
  });
  assert.equal(e.options.at(-1).image, "https://example.com/photo.jpg");
  assert.equal(
    copyEvent(e, member).options.at(-1).image,
    "https://example.com/photo.jpg",
  );
  e = changeEvent(e, owner, { type: "finish", optionId: "photo" });
  assert.equal(e.finalOption.image, "https://example.com/photo.jpg");
  e = changeEvent(e, owner, {
    type: "edit-option",
    optionId: "photo",
    name: "另一家",
    url: "",
    image: "",
  });
  assert.equal(e.options.at(-1).image, "");
});
