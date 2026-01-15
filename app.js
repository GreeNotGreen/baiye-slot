const client = window.supabase.createClient(
  "https://sdkrumvzefqgcrnomesm.supabase.co",
  "sb_publishable_dGKp0d2Se_-jJz1JReK24A_Qfv4S5yE"
);

async function load() {
  const { data, error } = await client
    .from("slots")
    .select("*")
    .order("slot_number");

  if (error) { alert(error.message); return; }

  const groups = {};
  data.forEach(s => {
    if (!groups[s.group_type]) groups[s.group_type] = [];
    groups[s.group_type].push(s);
  });

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  ["大团", "打野&守家"].forEach(type => {
    if (!groups[type]) return;

    const groupDiv = document.createElement("div");
    groupDiv.className = "group";

    const title = document.createElement("h3");
    title.innerText = `【${type}】`;
    groupDiv.appendChild(title);

    const section = document.createElement("div");
    section.className = "grid";

    groups[type].forEach(s => {
      const div = document.createElement("div");
      div.className = "slot" + (s.taken ? " taken" : "");

      // 设置颜色：黄 / 绿 / 蓝
      if ([1,2,3,16,17,21,22].includes(s.slot_number)) div.classList.add("yellow");
      else if ([4,5,10,15,20,25,30].includes(s.slot_number)) div.classList.add("green");
      else div.classList.add("blue");

      div.innerText = s.taken ? `${s.slot_number}\n${s.name}` : s.slot_number;

      if (!s.taken) div.onclick = () => take(s.slot_number);
      section.appendChild(div);
    });

    groupDiv.appendChild(section);
    grid.appendChild(groupDiv);
  });
}

// 抢号
async function take(num) {
  const name = prompt("请输入昵称 / 游戏ID");
  if (!name) return;

  const { error } = await client
    .from("slots")
    .update({ taken: true, name })
    .eq("slot_number", num)
    .eq("taken", false);

  if (error) alert("失败：" + error.message);
  load();
}

// 取消报名
async function cancelSign() {
  const name = prompt("请输入你报名的昵称 / 游戏ID");
  if (!name) return;

  // 先查询是否存在
  const { data, error: selectError } = await client
    .from("slots")
    .select("*")
    .eq("name", name)
    .eq("taken", true);

  if (selectError) {
    alert("查询失败：" + selectError.message);
    return;
  }

  if (!data || data.length === 0) {
    alert("你乱打的吧！");
    return;
  }

  // 有找到才取消
  const { error } = await client
    .from("slots")
    .update({ taken: false, name: null })
    .eq("name", name)
    .eq("taken", true);

  if (error) alert("取消失败：" + error.message);
  else alert("已成功取消报名！");
  load();
}
load();
