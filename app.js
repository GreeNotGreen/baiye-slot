const client = window.supabase.createClient(
  "https://sdkrumvzefqgcrnomesm.supabase.co",
  "sb_publishable_dGKp0d2Se_-jJz1JReK24A_Qfv4S5yE"
);

async function load() {
  const { data, error } = await client
    .from("slots")
    .select("*")
    .order("slot_number");

  if (error) {
    alert(error.message);
    return;
  }

  const groups = {};

  // 分类分组
  data.forEach(s => {
    if (!groups[s.group_type]) groups[s.group_type] = [];
    groups[s.group_type].push(s);
  });

  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  // 固定显示顺序：大团 → 打野
  ["大团", "打野"].forEach(type => {
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

      // ✅ 5,10,15,20,25,30 保持绿色
      if ([5, 10, 15, 20, 25, 30].includes(s.slot_number)) {
        div.classList.add("highlight");
      }

      div.innerText = s.taken ? `${s.slot_number}\n${s.name}` : s.slot_number;

      if (!s.taken) div.onclick = () => take(s.slot_number);
      section.appendChild(div);
    });

    groupDiv.appendChild(section);
    grid.appendChild(groupDiv);
  });
}

async function take(num) {
  const name = prompt("请输入昵称 / 游戏ID");
  if (!name) return;

  const { error } = await client
    .from("slots")
    .update({ taken: true, name })
    .eq("slot_number", num)
    .eq("taken", false);

  if (error) alert("抢号失败：" + error.message);
  load();
}

load();
