window.SETTINGS_PACK = {
  sections: [
    {
      id: 's-general', title: '01 · General Settings：先让眼睛和代码都舒服',
      summary: '这是编辑器外观与通用行为设置，不是编译器参数。先选作用域，再改字号、缩进、编码和补全。',
      entry: {
        theia: {path: 'File → Preferences → General Settings...', note: '也可从左下角 Settings 齿轮进入；本节真实截图来自 CCS 20.5.1 官方手册，画面不一定采集于同一小版本。'},
        eclipse: {path: 'Window → Preferences', note: '旧版用分类树：字体在 General → Appearance → Colors and Fonts，工作空间编码在 General → Workspace。'}
      },
      scope: 'User 是本机个人偏好，Workspace 只影响当前工作空间；多根工作空间还可能有 Folder。更具体的 Folder 覆盖 Workspace，Workspace 再覆盖 User。',
      fields: [
        {name: 'User / Workspace / Folder', meaning: '决定这次修改影响哪些文件和工程。User 不是“优先级最高”，而是更广的默认层。', armAdvice: '字号先放 User；团队约定的缩进与文件规则才考虑工作空间。看到 modified in: Workspace，要去对应层检查覆盖值。'},
        {name: 'Search Settings / Font Size / Font Family', meaning: '搜索框按名称筛选设置；编辑器字体、终端字体和整个界面缩放不是同一项。', armAdvice: '搜索 font，先把代码字号调到自己舒适的范围，再看中文与英文混排。终端太小就进入 Terminal 对应字体设置，不反复修改代码字号。'},
        {name: 'Tab Size / Insert Spaces / Auto Save', meaning: '分别控制缩进显示宽度、Tab 是否写入空格，以及自动保存行为。', armAdvice: '遵循项目现有缩进。开启自动保存前，先理解它会何时把修改写入磁盘，避免把临时实验当成未保存草稿。'},
        {name: 'encoding / suggest（搜索词）', meaning: '用搜索定位编码和补全选项；本机具体条目名称及可用范围【待核对】，不要假设所有其他编辑器选项都存在。', armAdvice: '乱码先按原编码重新读取并核对内容，再决定转为 UTF-8。补全缺失还要检查 include、宏与语言服务，而非只提高弹窗触发频率。'}
      ],
      recipe: ['先选 User，在搜索框输入 font，调整代码字号并打开有中文注释的 .c 文件对照。', '切到 Workspace 看有无覆盖；再搜索 encoding、suggest，按实际出现的说明逐项核对。', '只改一项，返回源码确认效果；对编码操作先保留原文件副本，确认文字正确后再保存。'],
      verify: ['同一文件的中文、英文与行号都可读；终端字体也达到舒适大小。', '能指出生效设置来自哪一层，知道改 User 后为什么可能看不到变化。'],
      pitfalls: ['读取乱码后直接保存会把错误解码的文字写回文件；改变默认编码不一定修复已打开文件。', '编码、补全叶子项随安装版本和扩展变化；找不到时在本机 General Settings 搜索，而不照抄别的 IDE 菜单。'],
      imageIds: [], sourceIds: ['settings-ide20', 'settings-ide12']
    },
    {
      id: 's-ccs', title: '02 · CCS Settings：工具链、SDK 与完整构建日志',
      summary: '这里回答“CCS 发现了哪些工具”和“日志显示多少”，与工程实际选用哪个编译器是两步。',
      entry: {
        theia: {path: 'File → Preferences → Code Composer Studio Settings...', note: '左侧 General 管工具发现；Build 管日志详细程度和日志文件。'},
        eclipse: {path: 'Window → Preferences → Code Composer Studio → Build → Compilers', note: '旧版工具发现入口不同；本节 Theia 的日志等级名称不要硬套到旧版。'}
      },
      scope: '这里的 Variables 面向当前工作空间关联的工程；工具发现提供可选候选，不会自动把每个工程切换到新版本。',
      fields: [
        {name: 'General → Compilers', meaning: 'Discovered compilers 列出已识别编译器；Compiler discovery-path 决定搜索位置，Refresh 重新扫描。', armAdvice: '先确认 aarch64-elf-gcc 的实际安装位置和版本。若外置 GNU 工具链不被当前插件识别，不要改名伪装成 TI 编译器；按工程的外部构建方式处理。'},
        {name: 'General → Products', meaning: '发现已安装 SDK 等产品，Product discovery-path 与 Refresh 用来补充搜索。', armAdvice: 'SDK 文件夹存在不代表被正确识别，更不代表工程已选中该 SDK 版本；还要检查工程的 Product dependencies。'},
        {name: 'Build-output verbosity', meaning: 'Automatic 会按工程规模调整；Verbose 显示更多细节，Balanced 折中，Concise/Minimal 收起部分信息。', armAdvice: '排查路径、宏和链接问题时临时用 Verbose，保存完整命令；问题解决后可回 Automatic。错误和警告不会因为选 Minimal 就自动消失。'},
        {name: 'Build-output log file', meaning: '指定把构建输出写入哪个本地文件，便于保存一次完整现场。', armAdvice: '选择你能找到的日志位置，重新构建后核对文件时间与首尾。给别人排错时连同活动配置、工具链版本和首条错误一起提供。'}
      ],
      recipe: ['先在 General → Compilers 检查发现列表，必要时补充搜索目录并 Refresh。', '回到具体工程 General 查看 Compiler，确认使用的是预期版本。', '在 Build 将日志暂设 Verbose，填写日志文件并重新构建一次，最后回到 Output 对照实际命令。'],
      verify: ['发现列表、工程所选 Compiler 与构建日志里执行的程序一致。', '能从保存的日志还原失败命令，不只截最后一行 make 错误。'],
      pitfalls: ['Refresh 只是重扫，不能修复缺失的工具链安装或不受支持的集成。', '外部 Makefile 若自己隐藏命令，IDE 的 Verbose 不保证展开它；还需核对该构建系统的日志开关。'],
      imageIds: [], sourceIds: ['settings-ide20', 'settings-project20', 'settings-project12']
    },
    {
      id: 's-project', title: '03 · 工程 General：器件、编译器与当前配置',
      summary: '先认清你正在设置哪一个工程，再核对器件、输出类型、探针和编译器；截图中的器件值不能照抄。',
      entry: {
        theia: {path: 'Explorer → 工程右键 → Properties → General', note: '图中标题栏显示工程名和 [Debug]；先核对它，再查看 General 中的器件与工具选择。'},
        eclipse: {path: 'Project Explorer → 工程右键 → Properties → General', note: '可用 Alt+Enter 打开已选工程属性；旧版具体字段分组按安装版本核对。'}
      },
      scope: '工程属性属于被选中的工程。你有七个相关工程，改 Application 不代表同步修改 Algo、Driver 或 Thirdparty。',
      fields: [
        {name: 'Device family / Device variant / core', meaning: '显示创建工程时确定的器件家族、型号和核心；CCS 20.5.1 的这些字段在此处只读。', armAdvice: '先核对真实 SoC 型号与 A53 核。选错器件不能靠在此输入另一名字解决，需评估工程迁移或按正确 SDK 模板重建。'},
        {name: 'Connection', meaning: '当前工程启动调试时使用的探针连接选择，可修改。', armAdvice: '按已确认的 XDS200 选择相应连接；它不能替代 .ccxml 对具体板卡、核心和初始化脚本的描述。'},
        {name: 'Output type / Compiler', meaning: 'Output type 显示可执行文件或静态库类型，在本页只读；Compiler 可从可用编译器中选择。', armAdvice: 'Application 通常产出最终 ELF，依赖工程可能产出 .a。以项目实际结构为准，核对所有参与链接的库与主程序架构、ABI一致。'},
        {name: 'Build Configuration', meaning: '活动配置决定这次采用的编译、链接和输出配方，不能仅靠工程名字判断。', armAdvice: '从工程右键 Build Configurations 查看并选择 Debug；若只有 Debug 就不寻找 CPU1_RAM。更换编译器后重建相关依赖，再检查实际命令。'}
      ],
      recipe: ['在 Explorer 先单击 Application，打开属性并记录 General 中的核心、输出类型、Connection 和 Compiler。', '返回工程右键的 Build Configurations 核对活动 Debug，再分别检查参与链接的库工程。', '保存修改后重建一次；用日志里的编译器路径和最终 ELF 时间确认设置确实生效。'],
      verify: ['能说清哪个工程生成 ELF，哪些工程提供静态库。', '工程、.ccxml、编译架构和实际选择的调试核心相互对应。'],
      pitfalls: ['官方截图可能使用其他 TI 芯片；它只用于找字段位置，不是你的 A53 参数清单。', 'Compiler 下拉项缺失时先解决工具发现，不为消掉报错随意选一个不同架构编译器。'],
      imageIds: [], sourceIds: ['settings-project20', 'settings-project12']
    },
    {
      id: 's-builder', title: '04 · Build：谁生成 Makefile，谁执行构建',
      summary: '先分清管理式构建与自定义 Makefile，再判断应该修改 CCS 选项还是项目自己的构建脚本。',
      entry: {
        theia: {path: '工程右键 → Properties → Build', note: '此处是构建器设置；编译器参数在下方 Tools，不在 Build-command Flags 里填写。'},
        eclipse: {path: '工程右键 → Properties → Build', note: '旧版 Builder Settings / Behavior 等页签组织不同，按字段含义对应。'}
      },
      scope: '影响所选工程的构建流程。先核对当前配置和输出目录；多工程依赖的构建顺序另由 Dependencies 管理。',
      fields: [
        {name: 'Build-command mode / Build-command', meaning: '选择默认构建命令或自定义命令；只有指定自定义命令模式时，命令文本才可编辑。', armAdvice: '现有工程能正常构建时保留原模式。不要为了增加 -I 或 -D 就替换整个 make 命令，这些参数应交给编译器。'},
        {name: 'Build source-files in parallel / Stop on first build-error', meaning: '前者允许多个编译任务并行；后者决定遇错是否停止，取消勾选时构建器可能继续报告更多错误。', armAdvice: '初学排错先追第一条真正错误；并行输出可能交错。资源紧张时减少任务数，不把无限任务当作越多越快。'},
        {name: 'Makefile generation mode / Build-directory', meaning: '选择由 CCS 自动生成，还是使用指定目录中的自定义 Makefile。', armAdvice: '自动生成文件不适合手改，下一次构建可能被覆盖。若选择自定义 Makefile，GUI 中某个 Tools 字段未必参与实际编译，必须查看生成命令。'},
        {name: 'Make-target to run on build / clean', meaning: '分别指定普通构建和清理调用哪个 make 目标，常见默认值为 all 与 clean。', armAdvice: '自定义脚本必须确实有这些目标。清理只处理其定义的产物，不保证一起删除其他兄弟工程的输出。'}
      ],
      recipe: ['先读 Build-command mode 与 Makefile generation mode，写下当前工程由谁维护 Makefile。', '检查 Build-directory 是否为预期 Debug 输出位置，再核对 build/clean 目标。', '执行一次 Clean 后 Build，观察输出命令、工作目录和重新生成的文件；不为验证而随意改默认模式。'],
      verify: ['能明确指出一个配置项最终由 CCS 生成，还是由自定义 Makefile 决定。', '构建失败时能从完整命令定位失败阶段，知道最后的汇总错误不一定是根因。'],
      pitfalls: ['Build-command Flags 传给构建工具，Compiler Flags 传给编译器，两者不能混填。', 'Pre-build/Post-build 属于额外步骤；不熟悉用途时先读现有命令，避免删除生成头文件等必需步骤。'],
      imageIds: [], sourceIds: ['settings-project20', 'settings-project12']
    },
    {
      id: 's-gnu', title: '05 · GNU Tools：让每个参数都落到真实命令上',
      summary: '用参数的实际含义定位设置，不编造某个 GNU 插件必有的叶子菜单。截图中的 TI 选项不可直接照抄。',
      entry: {
        theia: {path: '工程属性 → Build → Tools → 对应 Compiler / Linker → Edit Flags', note: '官方确认存在 Tools 与 Edit Flags；你的 GNU 集成分组名称【待核对】，以本机树及实际命令为准。'},
        eclipse: {path: '工程属性 → Build → 当前 GNU Compiler / Linker', note: '具体 Include、Symbols、Optimization 页签随工具链集成变化；找不到时检查实际编译命令与构建脚本。'}
      },
      scope: '修改当前配置的编译或链接参数。自定义 Makefile 工程应修改实际脚本；在 GUI 填了值不等于构建器已经采用。',
      fields: [
        {name: '-I目录 / -D名称=值', meaning: '指定头文件搜索目录和预处理宏。GNU 使用 -D，不把 TI 的 --define 原样搬过来。', armAdvice: '若写 driver/gpio.h，搜索路径要指向 driver 的父目录；添加宏后用实际命令确认，注意 #ifdef 对定义为零的宏仍成立。'},
        {name: '-g / -O0、-Og、-O1～-O3', meaning: '调试信息与优化是不同开关；优化可能重排语句、删除变量，-g 本身不关闭优化。', armAdvice: '练习单步时沿用团队确认的 Debug 配置并检查实际 -g 与优化参数。改变优化后重建再加载新 ELF，不能只 Restart。'},
        {name: '-march=armv8-a+fp+simd', meaning: '限制编译器允许生成的目标指令能力；启用浮点和 SIMD 编译能力不等于启动代码已完成运行环境设置。', armAdvice: '以现有板卡 BSP 为准，核对库和主程序的架构及 ABI；别为了性能擅自扩大指令集或替换 CPU 参数。'},
        {name: '链接脚本 -T / map 输出 -Map', meaning: 'GNU 链接脚本安排内存；map 报告实际放置。经 gcc 驱动传链接参数时使用 -Wl,。', armAdvice: '例如 -Wl,-Map=Application.map；直接调用 ld 时用 -Map=Application.map。脚本路径和内存大小必须来自真实板卡布局。'}
      ],
      recipe: ['保存一条现有成功编译命令，再在对应编译器设置中只改一个所需参数。', '重新构建，在 Output 检查 -I、-D、-g、优化与 -march 的真实展开值。', '检查最终链接命令中的脚本和 map 选项，再确认新 ELF 与 map 的时间。'],
      verify: ['GUI 所填路径和宏能够在对应命令中找到；参数传给了正确工具。', 'map 中的段位置与脚本一致，调试器加载的是此次构建输出。'],
      pitfalls: ['不要同时在多个页面重复填同一选项；冲突的参数可能按出现顺序覆盖。', '截图若展示 TI Compiler 的名称和参数，只借它找位置；你当前用 GNU，叶子字段和参数语法必须重新核对。'],
      imageIds: ['theia-ccs_project-pre-link-command'], sourceIds: ['settings-project20', 'settings-gccpre', 'settings-gccopt', 'settings-gccdebug', 'settings-gccarm', 'settings-ld']
    },
    {
      id: 's-dependencies', title: '06 · Dependencies、Variables 与链接文件',
      summary: '分清“先编哪个工程”“路径如何展开”和“文件实际放哪里”，才能让整个仓库搬家后仍可构建。',
      entry: {
        theia: {path: '工程属性 → General → Dependencies / Variables；工程右键 → Add Files/Folders', note: '前两项管理依赖和构建变量；链接文件通过添加文件入口选择。'},
        eclipse: {path: '工程属性 → General / Project References / Resource → Linked Resources', note: '旧版字段分布不同；添加外部文件可用工程右键 Add Files... 后选择 Link。'}
      },
      scope: 'Dependencies 与工程 Variables 属于所选工程；CCS Settings 中的 Variables 可面向工作空间。链接资源仍指向原始文件位置。',
      fields: [
        {name: 'Product dependencies', meaning: '工程依赖的 SDK、工具产品及版本，不是普通 .c 文件列表。', armAdvice: '先确认所需 SDK 已被发现，再核对选中的版本；它不能代替把所有需要的库正确传给链接器。'},
        {name: 'Project dependencies', meaning: '声明其他工程应在当前工程之前构建，依赖工程需已出现在 Explorer。', armAdvice: 'Application 需要 Algo、Driver 等库时，先确认构建顺序，再检查最终链接命令是否真的包含对应 .a；先构建并不自动等于链接。'},
        {name: 'Variables', meaning: '显示用户和系统构建变量，帮助把路径写成随工程移动的表达式。', armAdvice: '先确认 ${PROJECT_ROOT} 的实际展开位置；兄弟目录可按真实结构使用 ../Common/include。变量不是交叉编译器天然识别的语法。'},
        {name: 'Linked file / Available path-variables', meaning: '链接把工程外文件显示在项目中，并不生成独立副本；可用路径变量避免写死本机盘符。', armAdvice: '先查看真实路径再编辑，尤其是共享 Thirdparty 与 SDK 源码。链接正确后仍要独立核对编译器 include 搜索路径。'}
      ],
      recipe: ['在 Application 的 Dependencies 中确认必需库工程，保存后观察它们是否先构建。', '打开 Variables 查看展开值，再检查一个外部链接文件的原始磁盘路径。', '把完整仓库副本移到另一目录试编；若仍引用旧位置，回查变量、链接资源与脚本中的绝对路径。'],
      verify: ['日志显示正确的依赖构建次序，最终链接也使用新生成的库。', '能解释一个链接文件在磁盘上的真实位置，以及修改它会影响哪些工程。'],
      pitfalls: ['复制工程不保证复制工程外的链接资源；发给别人前要做独立目录验证。', '编辑器能跳转到某个头文件，不代表编译器使用同一路径；以实际 -I 与包含日志为证。'],
      imageIds: [], sourceIds: ['settings-project20', 'settings-project12', 'settings-ide20']
    },
    {
      id: 's-debug', title: '07 · Debug：加载什么，是否复位，停在哪里',
      summary: '把启动配置、程序加载与自动运行拆开检查，解决“明明点了调试，却不是我想要的状态”。',
      entry: {
        theia: {path: '工程右键 → Properties → Debug；运行中也可 Threads → 核心右键 → Properties → Debug', note: '启动 JSON 可从 Debug 的 Open launch.json 按钮查看；位于工作空间 .theia 中。'},
        eclipse: {path: '工程右键 → Properties → Debug；Run → Debug Configurations...', note: '旧版启动配置界面不同，不把 Theia 的 launch.json 字段搬入旧版。'}
      },
      scope: '项目 Debug 属性、当前核心调试属性与启动配置承担不同工作。多核调试先核对所选核心，再修改对应设置。',
      fields: [
        {name: 'launch.json：projectInfo / connections', meaning: '项目启动与无项目启动使用不同字段位置；loadSymbolsOnly 决定仅加载符号还是程序和符号。', armAdvice: '优先保留自动生成结构，不手改受 CCS 管理的项目名和标识。仅加载符号时，目标现有程序必须与 ELF 匹配，不能拿旧固件配新符号。'},
        {name: 'Program/Memory Load Options', meaning: '控制加载校验、连接时暂停或复位，以及加载/重启时是否复位。', armAdvice: '检查实际勾选状态，再判断 Restart 会做什么。A53 的复位范围依目标而定，不能假定所有外设、DDR和其他核都回到上电状态。'},
        {name: 'Verification Options', meaning: 'Full 回读更多已加载内容，Fast 抽查首尾，No 不做加载后比对。', armAdvice: '首次排查加载失败可关注校验结果；校验成功只说明所检查内容一致，不证明启动条件或应用逻辑正确。'},
        {name: 'Debugger Options → Auto Run Options', meaning: '决定加载或重启后是否自动运行到指定符号；常见目标为 main。', armAdvice: '要观察入口，清空符号并取消自动运行触发项；只清空符号却保留触发勾选，可能会让程序直接持续运行。'},
        {name: 'Realtime Options', meaning: '某些访问方式会自动 Halt → Access → Resume；无停机访问仍要求目标支持。', armAdvice: 'XDS200 不保证 A53 非侵入刷新可用。TI Compiler 专属 CIO/退出断点选项也不能直接作为 GNU printf 的开关。'},
        {name: 'Cortex A53 Disassembly Style Options', meaning: '选择反汇编显示采用 Mixed A32/A64、A64 Only 等指令解码方式；这不是切换 CPU 执行状态的开关。', armAdvice: 'AArch64 代码应核对 A64 解码与实际执行状态。配图为 AM6548 EVM + XDS110，只借它找 A53 设置，不把探针或板卡配置照搬到你的 XDS200。'}
      ],
      recipe: ['记录当前核心与 ELF 路径，查看启动配置属于项目还是无项目方式。', '检查加载校验、复位和 Auto Run 三组设置；只改变与你的目标直接有关的一项。', '重新启动一次调试，观察输出、PC和停住位置是否符合预期，再保存这组可复现设置。'],
      verify: ['能解释本次是写入程序还是只读符号，也知道加载后为何停在 main 或入口。', '观察到的 PC、源码与所选核一致；失败时保留日志与现场。'],
      pitfalls: ['Restart 的默认含义是重新定位入口，但配置可额外触发复位；必须连同选项一起判断。', '关闭校验不能修复不可写内存；勾选实时模式不能创造硬件不支持的能力。'],
      imageIds: [], sourceIds: ['settings-debug20', 'settings-debug12']
    },
    {
      id: 's-target', title: '08 · .ccxml：XDS200、核心与初始化脚本',
      summary: 'Basic 选择探针与板卡，Advanced 描述连接和核心细节；先用板卡支持包提供的配置，再按证据调整。',
      entry: {
        theia: {path: '打开 .ccxml → Target Configuration Editor → Basic / Advanced', note: '若打开成 XML 文本，用 Open With → Target Configuration Editor。新建入口位于 Debug → Target Configuration。'},
        eclipse: {path: 'View → Target Configurations → 打开 .ccxml → Basic / Advanced', note: '文件格式作用相同，但外围视图布局不同。'}
      },
      scope: '.ccxml 描述调试连接及目标结构，可选 GEL 用于初始化；它不负责 GNU 链接器的段分配，后者由 .ld 决定。',
      fields: [
        {name: 'Basic → Connection / Board or Device', meaning: '选择调试探针连接与实际板卡或器件，决定下面的目标结构。', armAdvice: 'Connection 对应 XDS200；具体 SoC 尚未确认，Board or Device 必须按板卡资料选择，不能只凭“同样是 A53”套别人的项。'},
        {name: 'Save / Test Connection(s)', meaning: '保存后测试底层调试链路，日志说明测试经过哪些阶段。', armAdvice: '先读失败步骤再读结尾。测试通过不表示核心已上电、DDR已初始化或 ELF 可以运行；这些还要按 SDK 调试流程完成。'},
        {name: 'Advanced → Connection Properties', meaning: '可配置连接时钟、工作模式或其他探针属性，实际字段依连接和器件而变。', armAdvice: '先保留官方板级默认值。遇连接不稳时依据探针/板卡文档调整，不照抄其他截图的频率、端序或端口编号。'},
        {name: 'Advanced → 核心树 / GEL startup files', meaning: '列出器件内部调试实体、核心和可选初始化脚本。板卡配置可能已经自动带入 GEL。', armAdvice: '核对要连接的是哪个 A53 核，GEL是否适合实际硬件；不要重复叠加不同板卡的DDR初始化。启动 JSON 的 JavaScript initializationScript 与 GEL 不是同一种脚本。'}
      ],
      recipe: ['优先找到该板卡 SDK 的 CCS/JTAG 配置示例，复制到练习工程后核对 Basic 中的 XDS200 与器件。', '保存并运行 Test Connection，保留完整结果；再检查 Advanced 的核心树与已有 GEL。', '按板卡流程完成初始化，手动连接目标核，再加载当前 Debug ELF验证。'],
      verify: ['配置中的器件、核心名和板卡资料一致，能解释已有初始化脚本的用途。', '能把底层测试通过与 CPU/内存准备完成分成两个证据记录。'],
      pitfalls: ['官方截图的板卡、探针与地址都是示例；其中任何芯片参数都不构成你这块板的推荐值。', 'Test Connection 失败不能单凭一条错误认定硬件损坏；先核对选择、供电、参考电压与连接。'],
      imageIds: [], sourceIds: ['settings-debug20', 'settings-debug12', 'settings-gel20', 'settings-jtag']
    },
    {
      id: 's-views', title: '09 · Graph、Memory 与 Clock：设置读数的含义',
      summary: '同一段内存按不同类型会显示不同结果；先定义数据范围、单位和调试核心，再解释波形与耗时。',
      entry: {
        theia: {path: 'View → Graph → Time / FFT；View → Memory；Run → Clock → Setup', note: 'Graph可选 FFT Magnitude/Phase；Clock是否可用取决于实际目标。'},
        eclipse: {path: 'Tools → Graph；View → Memory Browser；Run → Clock → Setup', note: '旧版图形属性常含 DSP Data Type、Acquisition Buffer Size 等，新版不能照搬这些字段。'}
      },
      scope: '这些设置主要改变调试视图和测量方式，不会替程序采样。多核时选准调试上下文，必要时把视图固定到对应核心。',
      fields: [
        {name: 'Graph：Expression / Capacity', meaning: 'Expression 需要数据地址；Time 的 Capacity 是最多绘制点数，不是采样频率。', armAdvice: '用全局 float samples[128]，先停住后输入 &samples，Capacity设128。先验证已知数组，再画真实数据，避免把后台更新的两帧拼在一起。'},
        {name: 'Graph：轴标题 / Frequency Display Unit', meaning: '轴标题是说明文字；FFT 频率显示单位决定呈现方式，不能凭标签生成真实采样时间。', armAdvice: 'Time 横轴本质是样点序号；解释秒或赫兹时必须知道采样率及该版本图形配置。更改单位不等于改变实际采样过程。'},
        {name: 'Memory：地址 / Display Type / Columns', meaning: '地址决定从哪里读，显示类型决定按何种宽度和数值方式解释，列数只改变排列。', armAdvice: '先核对变量类型和地址。float数组按整数看会像巨大数字；读取 MMIO 还需尊重寄存器访问宽度及读副作用。'},
        {name: 'Clock：Count / Reset Option', meaning: '可计数内容由目标决定；Manual累积到手动清零，Auto会在运行或单步前清零。', armAdvice: 'A53支持情况【待核对】，先看实际 Setup和目标文档。只有读到CPU cycles才按CPU频率换算；系统计时器ticks要用自己的时钟频率。'},
        {name: 'Refresh / Continuous Refresh', meaning: '手动刷新读取一次；连续刷新要求目标支持非侵入访问，否则可能只能暂停后更新。', armAdvice: '先验证暂停时读数正确，再测试运行刷新。缓存一致性和缓冲区更新机制仍需应用配合，不能仅凭窗口变化认定数据可靠。'}
      ],
      recipe: ['停在数组采样完成处，用Memory验证几个已知元素，再建立Time图并设置容量和地址表达式。', '打开Graph Properties修改标题以标明数据来源，确认固定到正确核心。', '若Clock支持，选清零策略并做起止断点实验；否则按板卡SDK计时器方案完成替代测量。'],
      verify: ['能说明横轴是样点还是时间，内存显示的每格代表多少位。', '计时结果同时记录计数类型、频率、优化与缓存条件。'],
      pitfalls: ['无运行时刷新能力或无Profile Clock支持时记录限制，不把灰色菜单解释为配置没学会。', '计时可能使用断点并扰动执行；Graph看见的是内存快照，不是独立采样仪。'],
      imageIds: ['theia-ccs_debug-graph_new'], sourceIds: ['settings-debug20', 'settings-debug12', 'settings-clock']
    }
  ],
  sources: [
    {id: 'settings-ide20', title: 'TI CCS 20.5.1 · User Interface / Settings', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_ide.html', scope: '真实设置截图、General Settings作用域、CCS工具发现与日志。'},
    {id: 'settings-project20', title: 'TI CCS 20.5.1 · Creating and Managing Projects', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_project-management.html', scope: '工程General只读/可编辑字段、构建器、Tools、依赖和变量。'},
    {id: 'settings-debug20', title: 'TI CCS 20.5.1 · Debug Overview', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_debug-main.html', scope: 'launch.json、Debug属性、AutoRun、ccxml、Graph/Memory/Clock设置。'},
    {id: 'settings-gel20', title: 'TI CCS 20.5.1 · General Extension Language', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_debug-gel.html', scope: 'GEL脚本与目标初始化用途。'},
    {id: 'settings-ide12', title: 'TI CCS 12.8 · Customizing the Environment', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_12.8.0/ccs_getting-started.html#customizing-the-environment', scope: '旧版Preferences、字体颜色和快捷键入口对照。'},
    {id: 'settings-project12', title: 'TI CCS 12.8 · Creating and Managing Projects', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_12.8.0/ccs_project-management.html', scope: 'Eclipse工程属性、编译器发现与链接资源对照。'},
    {id: 'settings-debug12', title: 'TI CCS 12.8 · Debug Overview', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_12.8.0/ccs_debug-main.html', scope: 'Eclipse调试属性、Graph与Memory Browser对照。'},
    {id: 'settings-gccpre', title: 'GCC · Preprocessor Options', url: 'https://gcc.gnu.org/onlinedocs/gcc/Preprocessor-Options.html', scope: 'GNU -D、头文件搜索和预处理语义。'},
    {id: 'settings-gccopt', title: 'GCC · Optimize Options', url: 'https://gcc.gnu.org/onlinedocs/gcc/Optimize-Options.html', scope: '优化等级和调试可见性的关系。'},
    {id: 'settings-gccdebug', title: 'GCC · Debugging Options', url: 'https://gcc.gnu.org/onlinedocs/gcc/Debugging-Options.html', scope: '-g与优化是独立选择。'},
    {id: 'settings-gccarm', title: 'GCC · AArch64 Options', url: 'https://gcc.gnu.org/onlinedocs/gcc/AArch64-Options.html', scope: '-march和架构扩展；以实际工具链版本支持为准。'},
    {id: 'settings-ld', title: 'GNU ld · Options', url: 'https://sourceware.org/binutils/docs/ld/Options.html', scope: '-T、-Map及通过编译器驱动传链接选项。'},
    {id: 'settings-jtag', title: 'TI · Debugging JTAG Connectivity Problems', url: 'https://software-dl.ti.com/ccs/esd/documents/ccs_debugging_jtag_connectivity_issues.html', scope: '底层连接测试与分阶段定位。'},
    {id: 'settings-clock', title: 'TI · Counting Cycles', url: 'https://software-dl.ti.com/ccs/esd/documents/ccs_counting_cycles.html', scope: '周期计数与支持条件。'}
  ]
};
