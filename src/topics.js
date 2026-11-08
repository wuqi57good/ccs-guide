window.TOPIC_PACK = {
  topics: [
    {
      id: 'tA', title: 'A · 把工程安稳地搬进来',
      summary: '分清工作空间、真实文件和构建配置，避免“昨天能编，今天找不到”。',
      sections: [
        {title: '先分清桌面与文件夹', paragraphs: [
          'Workspace（工作空间）像你的工作桌，Project（工程）才是桌上的项目文件夹。Theia 的单文件夹工作空间通过 File → Open Folder... 打开；CCS 会在其中使用 .theia 保存相关设置和启动配置。多个彼此独立的目录可以组合成 Multi-Root Workspace（多根工作空间），再用 File → Save Workspace As... 保存为 .theia-workspace。它记录“桌上放哪些文件夹”，不会自动打包所有源码。',
          '【Eclipse 12.x】旧工作空间的 .metadata 保存索引、布局和工作空间设置；它不是源码备份。切换 workspace 后，原工程不会自动删掉，但新空间里的工程列表和偏好可能不同。两代 CCS 的工作空间元数据不同，不要靠复制 .metadata 给 Theia 恢复工程。迁移旧工程前先复制一份完整目录，防止新版升级工程描述后旧版无法重新打开。'
        ]},
        {title: '先看原始目录，再决定是否复制', paragraphs: [
          '打开 Import Project(s)（导入工程），选择包含现有 CCS 工程的目录，检查发现的工程名。你的 Adapter、Algo、Application、Common、Driver、HgoP、Thirdparty 应尽量保持原有相对位置；先导入依赖库，再选 Application 检查构建依赖。工程都出现不等于链接依赖已经正确：库是否先编译、Application 是否真正链接对应 .a，还要看构建日志。',
          '选择复制到工作空间，会生成新的工程副本；选择保留原位置，编辑就直接作用于原文件。Theia 会把相应目录加入工作空间。复制主工程不保证把工程外的 Linked Resources（链接资源）一并复制：链接只是“指向另一处文件的路标”。练习时先核对文件实际路径，尤其留意 Thirdparty 或 SDK 中的共享文件；改动它可能影响所有引用它的工程。'
        ]},
        {title: '看得见头文件，还不等于编译器找得到', paragraphs: [
          '把 .c/.h 拖入 Explorer，只解决文件归属。编译器还要按 -I 指定的目录寻找 #include。若写 #include "driver/gpio.h"，就应加入包含 driver 文件夹的上一级目录，而不是直接填 gpio.h 的路径。管理式工程可在属性的编译器选项中配置；自定义 Makefile 工程要改真正执行的 Makefile。保存后重新构建，在 Output 的实际命令里确认 -I 已展开成预期位置。',
          '例如各工程是兄弟目录时，Application 可使用 ${PROJECT_ROOT}/../Common/include；这里的 ${PROJECT_ROOT} 必须在当前 CCS 工程变量中确实可用。它是 IDE 的构建变量，并非交叉编译器直接理解的语法。路径变量下拉框与 General → Variables 可帮助确认展开值；链接资源和编译器搜索路径是两套设置，修好一个不会自动修好另一个。'
        ], code: 'repo/\n├─ Application/       ← 当前工程根目录\n├─ Common/include/    ← ${PROJECT_ROOT}/../Common/include\n├─ Driver/\n├─ Adapter/\n├─ Algo/\n├─ HgoP/\n└─ Thirdparty/\n\n/* Common/include/driver/gpio.h */\n#include "driver/gpio.h"'},
        {title: '一套源码，两份构建配方', paragraphs: [
          'Build Configuration（构建配置）是整份配方，控制宏、优化、链接脚本和输出目录；Exclude from Build（不参与构建）只决定某个文件是否参加所选配置。切换后先确认项目的活动配置，再看实际 .elf 和 .map 的输出时间，避免加载上一次生成的文件。',
          '【仅 C2000 示例】CPU1_RAM / CPU1_FLASH 常对应不同 .cmd 与初始化方式；这些名字不是所有 CCS 工程自带的选项。你的 Arm GNU 工程目前按 Debug 配置学习。若以后需要 RAM/Flash 两份配置，应由开发板启动方案、GNU .ld 和实际烧写流程共同决定，不能只把配置改名为 Flash。',
          '交接给别人前，把完整仓库复制到另一个目录做一次构建，并检查日志里是否仍引用旧机器的绝对路径。若出现缺失文件，先追到对应链接资源或搜索路径，修复后再重新测试；这比等同事导入失败后逐个补文件更可靠。'
        ]}
      ],
      operations: ['ta-import', 'ta-workspace', 'ta-link', 'ta-config'],
      checks: ['能说清当前编辑的是副本还是原文件，并找到真实磁盘位置。', '在构建日志里找到已展开的头文件搜索路径。', '能区分活动构建配置与单个文件的 Exclude from Build。'],
      sourceIds: ['topic-project20', 'topic-start20', 'topic-project12']
    },
    {
      id: 'tB', title: 'B · 从编译日志走到内存地图',
      summary: '先定位失败发生在哪一站，再处理头文件、符号和内存溢出。',
      sections: [
        {title: 'Build、Rebuild、Clean 各有用途', paragraphs: [
          'Build（增量构建）重做变化的源文件及受影响的依赖；日常改代码先用它。Rebuild（完整重建）重新生成所选工程的构建结果，适合怀疑旧对象文件或依赖记录不一致时使用。Clean（清理）删除构建产物，本身不代表已经重新编译；清理后还要 Build。自定义 Makefile 的具体行为由其目标定义，不能只看按钮名称判断。',
          '在你的多工程结构里，Application 的链接步骤可能使用 Algo、Driver 等输出的静态库。只重编 Application，不一定会更新外部已存在的库文件。检查 Project Dependencies（工程依赖）和日志时间顺序：先生成库，再链接最终程序。看 Problems 定位文件，同时回到 Output 查看第一条失败命令及其前后文；最后的 make 错误常是前面失败的结果。'
        ]},
        {title: '给代码和变量分房子', paragraphs: [
          '编译器把各源文件制成小部件，链接器按链接脚本这张“户型图”安放代码和变量。头文件通过 #include 参与源文件编译，通常不单独生成一个对象文件。Arm GNU 常用 .o、.ld、.elf；TI C2000 常见 .obj、.cmd、.out。扩展名可由项目设置决定，文件名不等于文件格式。下面两条路线故意分开，避免把 C2000 的脚本语法抄进 GNU 工程。'
        ], code: 'Arm / GNU\n.c + 被包含的 .h\n        ↓ aarch64-elf-gcc -c\n      .o + .a + GNU 链接脚本 .ld\n        ↓ 链接\n      Application.elf + Application.map\n\n【仅 C2000 示例】TI 工具链\n.c + 被包含的 .h → .obj + .lib + TI 链接命令文件 .cmd\n                                  ↓ 链接\n                               .out + .map'},
        {title: '读 .map：先看房间，再看住户', paragraphs: [
          'GNU 链接通过编译器驱动时可增加 -Wl,-Map=Application.map；若命令直接调用 ld，则使用 -Map=Application.map。先在 map 中找 Memory Configuration，核对各区域的起始地址和长度，再找 .text、.rodata、.data、.bss 等输出段，向下看是哪个 .o 或库成员贡献了大小。地址与长度通常是十六进制，不能把 0x1000 当成一千字节。',
          'AArch64 的地址以字节为单位。粗算区域占用时，要把同一区域里的段、对齐间隙、预留栈堆一起考虑；有不同装载地址与运行地址时分别核算。.bss 虽不把初值逐字节装进映像，运行时仍占 RAM。文件大小也含调试等信息，不能直接当芯片 RAM 占用。可用 aarch64-elf-size -A 作辅助列表，再回到 map 确认实际放置。'
        ], code: '# 在现有链接命令中增加；不是完整链接命令\n-Wl,-Map=Application.map\n\n# 在工具链可用的终端查看各段大小\naarch64-elf-size -A Application.elf'},
        {title: '三类错误，按顺序急救', paragraphs: [
          '① 找不到头文件：TI 常见 cannot open source file，GNU 常见 fatal error: xxx.h: No such file or directory。先确认文件确实存在，再比对 #include 的层级、大小写和 -I 路径。只在编辑器中跳得进去，并不能证明编译命令使用了同一套路径。',
          '② 找不到实现：TI 常见 unresolved symbols remain，GNU 常见 undefined reference。声明只像“通讯录”，不提供函数体；检查对应 .c 是否被排除、.a 是否参与链接、库顺序和条件宏是否把实现剪掉。C/C++ 混用时再检查 extern "C"。每修一处都重新看第一条错误，别同时盲加多个库。',
          '③ 区域放不下：GNU 常见 region ... overflowed by ... bytes。定位超出的段和区域，先找新增大数组或重复输入。调整 .ld 的 MEMORY / SECTIONS 必须依据芯片真实内存图；跨越空洞、保留区或不可访问区域的“合并”并不会增加硬件内存。【仅 C2000 示例】修改 .cmd 也遵守同一原则，先确认物理连续和用途兼容再扩大分配。',
          '练习时先保存一次成功构建的日志和地图，再仅增加一个大小已知的全局数组，重新构建并比较对应段的变化。若大小没有变化，检查数组是否被优化或链接裁剪、是否真正被引用，以及所读地图是不是当前配置刚生成的文件。完成观察后撤回练习改动并重新构建。'
        ]}
      ],
      operations: ['tb-build', 'tb-rebuild', 'tb-clean', 'tb-map'],
      checks: ['能在日志中指出编译命令与链接命令各一条。', '能在 map 找到一个大数组所在段及其内存区域。', '能分别说出找不到头文件、找不到实现、内存放不下的第一步检查。'],
      sourceIds: ['topic-project20', 'topic-ldoptions', 'topic-ldmemory', 'topic-size']
    },
    {
      id: 'tC', title: 'C · 让 XDS200 与 A53 建立可信连接',
      summary: '把链路、CPU、程序和变量观察逐层打通，故障时保留第一现场。',
      sections: [
        {title: '.ccxml 是连接说明书', paragraphs: [
          'Target Configuration（目标配置）描述探针、器件、核心以及可能的初始化脚本。创建 .ccxml 时，Connection 选择对应的 XDS200，Board or Device 必须选实际 SoC 或开发板，而不是看到 Cortex-A53 就随便选一个。你的具体芯片型号尚未提供，DDR、启动模式和核上电步骤因此标为【待核对】：对照板卡 SDK 的 CCS/JTAG 调试章节。',
          '保存后运行 Test Connection(s)。读完整测试中的失败步骤和结尾结果；成功只证明底层 JTAG 测试通过，不等于 CPU 已解除复位、DDR 可访问或 ELF 可以运行。探针选错可能在打开驱动时失败，目标无电或参考电压异常可能无法扫描，接触不良可能间歇失败；这些症状会重叠，不能仅凭一句错误下结论。先核对配置、板卡供电、USB/排线与参考电压，再根据报错阶段排查。'
        ]},
        {title: '连接 CPU、加载程序、再停到源码', paragraphs: [
          '多核 SoC 建议先启动目标配置，再选准要调试的 A53 核连接。按板卡文档完成时钟、内存和核心初始化后加载 Application 的当前 Debug ELF。确认正在看这个核的调用栈与 PC，再在一条确实会执行的语句上放断点。停住后先 Step Over，再 Step Into 一个有源码的短函数，观察局部变量和返回位置；单步异常时保留 PC 与反汇编。',
          '软件断点像在可写代码里临时放一枚“停下”指令；硬件断点使用内核的地址比较资源，适合不可改写的代码区。【仅 C2000 示例】RAM 通常方便使用软件断点，Flash 场景常受硬件资源限制。Cortex-A53 TRM 的 ID_AA64DFR0_EL1 定义为六个硬件指令断点和四个观察点，但 CCS 实际能新设多少仍需核对已占用资源；Run to main、单步和计时工具可能使用临时断点，不能承诺六个全可用。'
        ]},
        {title: '三种“重新开始”并不是一回事', paragraphs: [
          'CPU Reset 触发选定范围的复位，究竟重置哪些外设和核心由目标决定；Restart 通常把 PC 放回程序入口，再受 Auto Run 设置影响，可能继续跑到 main；Load Program 则把所选映像的可装载段重新写入目标，并加载符号。Restart 不等于清空所有 RAM、不等于整板重新上电，也不保证重新执行全部板级初始化。',
          'Restart 后进不了 main，先看入口 PC、调用栈和调试输出，再确认栈、DDR、看门狗、异常级及启动代码前提是否仍成立。若代码已改，Restart 不会替你加载新 ELF。程序跑飞时先暂停，记录 PC 和调用栈再复位；A53 根据异常级检查 ELR_ELx、ESR_ELx、FAR_ELx 和向量表，含义对照 SoC/Arm 手册。【仅 C2000】ILLEGAL_ISR 是常见示例异常处理名，不能当作 A53 必有的入口。'
        ]},
        {title: '连续刷新不等于整个系统没有被打扰', paragraphs: [
          'Theia 的 Watch 对应旧版 Expressions。加入一个全局计数变量，先在暂停状态验证值，再尝试 Continuous Refresh。它像给运行中的发动机开观察窗，但目标必须支持非侵入访问；XDS200 型号本身不保证这项能力，也不保证多核缓存中的数据与调试口视图一致。若只能暂停后刷新，按实际结果记录，不把灰色按钮当作自己的操作错误。',
          '【仅 C2000 场景】Real-time Mode 可用于受支持器件的运行时调参；不要把这一模式直接套到 A53。先在低风险实验状态修改普通全局变量，核对写入值与程序行为。真实电机的 PID 参数应在既定调参范围内，经应用提供的更新机制生效；直接写一组参数可能读到中间状态。不能为了“不断机”开启会隐式 Halt → Access → Resume 的访问方式。'
        ]}
      ],
      operations: ['tc-target', 'tc-test', 'tc-connect', 'tc-reset', 'tc-restart', 'tc-load', 'tc-refresh'],
      checks: ['能说清 Test Connection 成功之后仍需检查哪些目标初始化。', '能在正确 A53 核暂停、单步并记录 PC。', '能区分 Reset、Restart 与 Load Program，并实测本目标是否支持运行时刷新。'],
      sourceIds: ['topic-debug20', 'topic-jtag', 'topic-reset', 'topic-armexception']
    },
    {
      id: 'tD', title: 'D · 把数组、耗时和栈变成看得见的证据',
      summary: '按目标支持情况使用 Graph、计时与数据导出，不把工具可见当作硬件可用。',
      sections: [
        {title: 'Graph：把一段数组画出来', paragraphs: [
          '先准备全局 float samples[128]，让程序完成采样后停住。Theia 20.5.1 使用 View → Graph → Time；Capacity 设为128并加入数组地址表达式 &samples，先核对是否正确识别数组类型和范围。具体类型/长度字段若与本机不同，按安装版本内置 Graph 帮助核对【待核对】。旧 Eclipse 使用 Tools → Graph → Single Time，按 Start Address、Acquisition Buffer Size、Display Data Size 和 DSP Data Type 配置。',
          '先画已知递增数组检查首地址、类型和点数，确认正常再看真实采样。时域横轴默认反映样点序号，只有知道采样率才能换成时间。Theia 20.5.1 已提供 FFT Magnitude / FFT Phase；频率解释还需正确采样率。Graph 读取目标内存，不会自动替你采样；采样缓冲区在后台更新时可能读到前后两帧，先冻结缓冲区是最容易验证的练习。早期 20.x 的 FFT 与界面字段请按安装版本核对。'
        ]},
        {title: 'Profile Clock：先确认能计，再计算时间', paragraphs: [
          '在支持的目标上，用 Run → Clock → Enable 开启周期计数；底部状态栏出现 Clock。设置测量起止两个断点，运行到起点，把计数清零，再运行到终点读取差值。Clock 会使用调试资源，测量具有侵入性；中断、缓存、外部存储等待和临时断点都可能改变结果。每次记录时连同优化等级、时钟和缓存状态一起记下。',
          '你的 A53 是否支持此 Profile Clock 路径【待核对】：连接实际核心后检查 Enable/Setup 状态与目标手册。TI 的周期计数说明也提供部分 Arm 的 Count Event 方法，但不能据此保证所有 A53 目标都有同一菜单。若本目标不支持，选用板卡 SDK 的系统计时器接口，先量空读开销，再量代码区间；按该计时器的频率换算，不直接拿 CPU 主频相除。硬件验收允许“确认不支持并完成替代计时”，不编造 Clock 读数。'
        ], code: '若读到的是 CPU cycles：\n耗时(μs) = 周期差 / CPU 频率(MHz)\n例：12,000 cycles / 600 MHz = 20 μs\n\n若读到的是系统计时器 ticks：\n耗时(μs) = tick 差 × 1,000,000 / timer_frequency_hz\n注意：计时器频率不一定等于 CPU 频率。'},
        {title: 'Stack Usage：函数帧大小只是第一张线索', paragraphs: [
          '对 GNU 工具链，在编译选项加入 -fstack-usage，重建后到对象输出目录查看 .su 文件。它报告各函数的栈使用信息以及 static、dynamic 等标记；dynamic 不总有静态上界。不要凭空寻找一个所有 CCS/编译器都支持的 Stack Usage 窗口；某些 TI 工具或项目分析功能有专门限制，你的 GNU 工程以 .su 为起点。',
          '函数自身占用不等于完整调用链峰值。排查溢出时把调用链、中断嵌套、递归、变长局部数组及不同异常级的栈分开考虑。先找突然变大的函数，再结合 map 中的栈预留区和运行时 SP 范围核对；清单上注明构建配置。单凭把一个大数组改成 static 虽可能减小函数栈，却会转成长期 RAM 占用，还需重看 map。'
        ], code: '# 加入当前 Debug 配置的编译器选项\n-fstack-usage\n\n# 重建后检查对应对象目录中的 *.su\n# 每函数条目不自动等于整条调用链的最大栈深度'},
        {title: 'Save / Load Memory：先保存，再解释数据', paragraphs: [
          '暂停目标并锁定采样缓冲区。Theia 在 Memory 中用 Export data to file，选择起始地址、范围和文件格式；旧版在 Memory Browser 使用 Save Memory。记录元素数、元素位宽、字节序和采样率。TI 的 .dat 可能带格式头，并非任意 MATLAB load 都能直接读取；按导出格式处理头部后解释数据，或选择明确的二进制格式并用匹配的类型读取。',
          'Load Memory / Import data from file 会改写目标内存，只在已经预留的测试缓冲区练习，长度以当前对话框单位为准。先导出原值，再导入短数据，刷新 Memory 并逐项比对。A53 启用缓存时还需遵循 SDK 的缓存一致性方案；本节不假定调试口写入会自动更新 CPU 缓存。'
        ]}
      ],
      operations: ['td-graph', 'td-fft', 'td-clock', 'td-stack', 'td-save', 'td-load'],
      checks: ['能把128点已知数组画出并说明横轴含义。', '能说明本板计时使用 CPU cycles 还是 timer ticks。', '能找到 .su 并说明为什么单函数数值不是最大调用链深度。', '能导出一段数组并记录格式、宽度、长度和字节序。'],
      sourceIds: ['topic-debug20', 'topic-clock', 'topic-stack', 'topic-debug12']
    },
    {
      id: 'tE', title: 'E · 沿着一次调用读懂整条驱动链',
      summary: '用“打开—追定义—找引用—回跳”的固定路线，减少在源码中迷路。',
      sections: [
        {title: '先建立阅读路线，再记快捷键', paragraphs: [
          '从 Application 的入口挑一条短路径，例如 main → Adapter → Driver。先打开文件，在 Outline（符号大纲）确认本文件包含哪些函数，再把光标放到调用名上跳定义。每跨过一层记一句“输入是什么、输出是什么、谁持有状态”，一次只追一条业务链。追到 Thirdparty 中很深的模板或寄存器宏时，先回到调用点理解用途，再决定是否继续向下。',
          '【Eclipse 12.x】Ctrl+Shift+R 开文件，Ctrl+O 看当前文件符号，F3 跳声明或定义，Ctrl+Shift+G 找引用，Alt+← / Alt+→ 沿位置历史回跳；Ctrl+H 打开搜索。这个组合适合旧版。你使用的 Theia 请从右键或 Go 菜单选择对应动作，并到 File → Preferences → Keyboard Shortcuts 搜索命令、核对实际按键。这里不把旧版 F3 直接冒充新版快捷键，也不根据“长得像”复制其他 IDE 的键表。'
        ]},
        {title: '符号引用与全文搜索，回答的问题不同', paragraphs: [
          'Find References（查引用）尝试按语言理解寻找同一个符号；全文搜索寻找同一串文字，会包含注释、字符串和同名但不同作用域的变量。想找“谁可能调用 Driver_Init”，先用引用，再用文本搜索补查函数指针注册表、宏封装和条件编译分支。静态引用不等于实际运行调用链，真正执行顺序仍需断点与调用栈验证。',
          '跳转结果少、跳到错误头文件或出现重复声明时，先核对活动工程和构建配置，再检查语言服务获得的 include 路径与宏。Theia 的编辑器诊断与构建器可能来自不同处理链，编辑器红线不会自动证明编译失败；反过来，编辑器没红线也不是链接成功的证据。以实际构建日志为结果，再把编辑器配置对齐。'
        ]},
        {title: '宏太深时，让预处理结果说话', paragraphs: [
          '悬停在宏名上通常可看到定义摘要；旧 Eclipse/CDT 的宏展开预览取决于已启用的编辑器支持，Theia 的同名展开命令不应视为必有。【待核对】若右键和命令列表没有相应入口，直接采用 GNU 的预处理输出：复制该 .c 的实际编译选项，保留同样的 -I、-D、架构选项，改用 -E 输出 .i。不要覆盖原来的 .o，也不要把示例占位路径直接拿去执行。',
          '#ifdef 灰显只代表编辑器根据当前宏集合做出的判断。若编译宏是 -DFEATURE=0，#ifdef FEATURE 仍成立；要按值判断应看代码是否使用 #if FEATURE。比较编辑器显示、实际命令与 .i 的相关段落，才知道当前编进去的是哪条分支。找不到头文件来源时，可对原编译命令增加 -H 并使用预处理模式，把实际包含层级输出到日志。'
        ], code: '# 以实际工程命令为基础；保留真实 -I / -D / 架构选项\naarch64-elf-gcc -E -dD main.c -o main.i\n\n# 显示实际头文件包含层级；仍需补齐项目原有选项\naarch64-elf-gcc -E -H main.c -o main.i\n\n#define FEATURE 0\n#ifdef FEATURE   /* 已定义，所以成立 */\n#endif\n#if FEATURE      /* 值为0，所以不成立 */\n#endif'},
        {title: '把一次修改控制在能解释的范围内', paragraphs: [
          '调试阅读时先只加一个断点或观察变量，验证后再改一处代码。改宏、优化或 include 路径后保存设置并重建，再确认加载的是新的 ELF。优化会折叠或移动源码语句，不能只靠行号跳动判断 CPU 执行顺序；必要时联合 Disassembly 与 PC。希望练习逐行阅读时，先检查 -g 与低优化配置是否实际出现在命令中。',
          'C/Git 基础目前未确认，先保留改动前的完整工程副本，记录修改文件和验证结果。若已经使用 Git，提交前查看差异，确认没有把本机绝对路径或大量生成文件一起带入。每天结束时写三句话：今天定位了什么、凭什么判断、下一次从哪个函数继续。这样两小时的学习能接上，而不是次日重新找入口。'
        ]}
      ],
      operations: ['te-definition', 'te-references', 'te-back', 'te-outline', 'te-file', 'te-search', 'te-preprocess', 'te-header'],
      checks: ['能从 Application 追到 Driver，再返回最初调用点。', '能解释符号引用与文字搜索各遗漏什么。', '能用实际构建选项生成预处理文件，确认一个宏分支。'],
      sourceIds: ['topic-ide20', 'topic-edit12', 'topic-preprocessor']
    }
  ],
  actions: {
    'ta-import': {label: '导入现有工程', target: 'tA', eclipse: {path: 'Project → Import CCS Projects...', key: '无统一默认键；使用菜单', note: '选择 Copy projects into workspace 时先核对链接资源是否仍在外部。'}, theia: {path: 'File → Import Project(s)', key: '无统一默认键；使用菜单', note: '选择搜索目录与工程，决定复制到工作空间或保留原位置。'}, result: 'Explorer 出现工程；打开其属性确认编译器与活动配置。'},
    'ta-workspace': {label: '切换或保存工作空间', target: 'tA', eclipse: {path: 'File → Switch Workspace → Other...', key: '无统一默认键', note: '.metadata 属于此工作空间；切换不等于移动源码。'}, theia: {path: 'File → Open Folder... / Open Workspace... / Save Workspace As...', key: '在 Keyboard Shortcuts 查询具体命令', note: '多根工作空间保存为 .theia-workspace。'}, result: '工程列表与工作空间设置随所打开的目录或工作空间文件变化。'},
    'ta-link': {label: '添加或链接外部源码', target: 'tA', eclipse: {path: '工程右键 → Add Files... → Copy files / Link to files', key: '无统一默认键', note: '链接变量与编译器 include 搜索路径要分别设置。'}, theia: {path: '工程右键 → Add Files/Folders → + → Select files to link', key: '无统一默认键', note: 'Available path-variables 可帮助使用相对链接。'}, result: '外部文件以链接形式出现在工程，编辑仍改动原文件。'},
    'ta-config': {label: '切换活动构建配置', target: 'tA', eclipse: {path: '工程右键 → Build Configurations → Set Active → Debug', key: '无统一默认键', note: '只会出现该工程实际定义的配置。'}, theia: {path: '工程右键 → Build Configurations → 选择配置', key: '无统一默认键', note: '不假定 Arm 工程有 CPU1_RAM / CPU1_FLASH。'}, result: '后续构建使用选定配方；在输出目录与编译命令中复核。'},
    'tb-build': {label: '增量编译当前工程', target: 'tB', eclipse: {path: '选中工程 → Project → Build Project', key: '菜单显示为准', note: '先保存源码，观察 Console 中实际执行的命令。'}, theia: {path: '选中工程 → Project → Build Project(s)', key: '菜单显示为准', note: '构建信息在 Output，摘要在 Problems。'}, result: '修改过的源文件及受影响依赖被重新编译，成功后更新目标文件。'},
    'tb-rebuild': {label: '完整重建工程', target: 'tB', eclipse: {path: '工程右键 → Rebuild Project', key: '无统一默认键', note: '自定义构建工程按其 make 目标行为执行。'}, theia: {path: '工程右键 → Rebuild Project(s)', key: '无统一默认键', note: '重建当前所选工程；外部库依赖也要确认。'}, result: '重新生成当前工程构建产物，日志显示各源文件的编译。'},
    'tb-clean': {label: '清理构建产物', target: 'tB', eclipse: {path: 'Project → Clean...', key: '无统一默认键', note: '清理后按需要重新 Build。'}, theia: {path: 'Project → Clean', key: '无统一默认键', note: '选择要清理的工程；清理本身不代表构建成功。'}, result: '当前构建产物被删除；下一次 Build 重新生成。'},
    'tb-map': {label: '生成并查看 Arm 内存占用', target: 'tB', eclipse: {path: '工程属性 → GNU Linker 选项 → 增加 -Wl,-Map=Application.map', key: 'Alt+Enter 打开工程属性', note: '通过 gcc 驱动传给链接器时使用 -Wl,；直接 ld 用 -Map=。'}, theia: {path: '工程右键 → Properties → Build → Tools → Linker → Edit Flags', key: '属性命令按本机 Keyboard Shortcuts', note: '确认实际链接命令调用 gcc 还是 ld；自定义 Makefile 应修改 Makefile。'}, result: '构建后出现 .map，按区域、输出段、输入对象逐层读大小与地址。'},
    'tc-target': {label: '创建 XDS200 目标配置', target: 'tC', eclipse: {path: 'File → New → Target Configuration File', key: '无统一默认键', note: '选择 XDS200 与实际开发板/SoC，保存 .ccxml。'}, theia: {path: 'Debug → Target Configuration 视图 → New Target Configuration', key: '无统一默认键', note: '也可在 Explorer 新建扩展名为 .ccxml 的文件。'}, result: '目标配置编辑器打开；它与控制内存布局的 .ld 各司其职。'},
    'tc-test': {label: '测试底层 JTAG 连接', target: 'tC', eclipse: {path: '打开 .ccxml → 保存 → Test Connection', key: '无统一默认键', note: '灰色时检查配置是否保存、连接类型是否支持。'}, theia: {path: '打开 .ccxml → 保存 → Test Connection(s)...', key: '无统一默认键', note: '读测试步骤与结尾；成功不保证 DDR、CPU 和程序准备就绪。'}, result: '出现底层测试日志；先解决第一处失败，再尝试连接核心。'},
    'tc-connect': {label: '手动连接指定核心', target: 'tC', eclipse: {path: 'Target Configurations → .ccxml 右键 → Launch Selected Configuration；Debug 中核心右键 → Connect Target', key: 'Ctrl+T（Eclipse 默认，菜单复核）', note: '选择与 ELF 匹配的核，先完成板卡要求的初始化。'}, theia: {path: 'Target Configuration → .ccxml 右键 → Start Project-less Debug；Threads 中核心右键 → Connect Target', key: '【待核对】Keyboard Shortcuts 搜索 Connect Target', note: '若安装版本菜单名称变化，按其内置 Debug 文档核对。'}, result: '指定核心状态从未连接变为已连接，可进行后续加载与暂停观察。'},
    'tc-reset': {label: '复位目标 CPU', target: 'tC', eclipse: {path: 'Run → Reset → 目标支持的复位项', key: '无统一默认键', note: 'CPU、系统、整板复位范围不同。'}, theia: {path: 'Threads 中核心右键 → Reset → 目标支持的复位项', key: '【待核对】Keyboard Shortcuts 搜索 Reset', note: '具体复位项由目标提供，不保证复位所有外设。'}, result: '核心按选定复位范围回到复位状态；观察 PC 和连接状态。'},
    'tc-restart': {label: '从程序入口重新开始', target: 'tC', eclipse: {path: 'Run → Restart', key: '菜单显示为准', note: '通常重新定位 PC；是否复位或自动到 main 受调试设置影响。'}, theia: {path: 'Debug 运行控制栏 → Restart', key: '【待核对】Keyboard Shortcuts 搜索 Restart', note: 'Restart 不会自动替换已下载的旧代码。'}, result: 'PC 返回入口并可能按 Auto Run 设置运行；内存不保证回到上电初值。'},
    'tc-load': {label: '加载新生成的程序', target: 'tC', eclipse: {path: 'Run → Load → Load Program...', key: '无统一默认键', note: '选择当前 Debug 构建输出，别误选只有符号的 Load Symbols。'}, theia: {path: 'Run → Load → Load Program...', key: '【待核对】Keyboard Shortcuts 搜索 Load Program', note: '目标必须已连接且内存初始化满足加载条件。'}, result: '可装载段与符号被更新；再核对源码、PC 和构建时间。'},
    'tc-refresh': {label: '连续观察运行中的变量', target: 'tC', eclipse: {path: 'Expressions → Add Expression → Continuous Refresh', key: '无统一默认键', note: '仅在目标支持运行时访问的条件下成立。'}, theia: {path: 'Debug → Watch → Add Expression → Continuous Refresh', key: '无统一默认键', note: 'XDS200 不单独决定是否支持；A53 还需核对非侵入访问与缓存一致性。'}, result: '支持的目标会周期更新值；若不支持，采用暂停后刷新并记录限制。'},
    'td-graph': {label: '把数组画成时域波形', target: 'tD', eclipse: {path: 'Tools → Graph → Single Time', key: '无统一默认键', note: '填数组首地址、采样点数和 DSP Data Type。'}, theia: {path: 'View → Graph → Time', key: '无统一默认键', note: '20.5.1 核验；输入地址表达式并核对类型、长度和 Capacity。'}, result: '读取目标数组绘制波形；已知测试数组应先显示出预期形状。'},
    'td-fft': {label: '查看数组的 FFT', target: 'tD', eclipse: {path: 'Tools → Graph → FFT Magnitude / FFT Phase', key: '无统一默认键', note: '按图形属性配置采样数据与采样率。'}, theia: {path: 'View → Graph → FFT Magnitude / FFT Phase', key: '无统一默认键', note: '20.5.1 已确认；早期20.x请核对对应版本 Graph 帮助。'}, result: '显示频域幅度或相位；采样率、类型和数据窗口必须与采样过程一致。'},
    'td-clock': {label: '测量两处断点之间的耗时', target: 'tD', eclipse: {path: 'Run → Clock → Enable / Setup', key: '双击状态栏 Clock 数值清零', note: '需目标支持；两断点之间的差值含中断等影响。'}, theia: {path: 'Run → Clock → Enable / Setup', key: '在 Clock 显示区按支持的清零操作', note: '【待核对】A53 目标支持性；不支持时使用 SDK 计时器并按其频率换算。'}, result: '得到带测量条件的周期差或计时器 tick 差，不把不支持的按钮视为操作失败。'},
    'td-stack': {label: '查看 GNU 函数栈使用信息', target: 'tD', eclipse: {path: '工程属性 → GNU Compiler 选项 → 增加 -fstack-usage → 重建', key: 'Alt+Enter 打开工程属性', note: '查看 .su；不假设有通用 Stack Usage 图形窗口。'}, theia: {path: '工程属性 → Build → Tools → Compiler → Edit Flags → 增加 -fstack-usage', key: '无统一默认键', note: '自定义 Makefile 工程修改实际编译选项。'}, result: '对象输出目录生成 .su，可逐函数排查栈帧，但还需分析调用链。'},
    'td-save': {label: '导出目标内存数据', target: 'tD', eclipse: {path: 'Memory Browser → 视图菜单 → Save Memory', key: '无统一默认键', note: '填写范围、格式，核对长度单位与数据位宽。'}, theia: {path: 'Memory → Export data to file', key: '无统一默认键', note: '先冻结缓冲区，记录地址、元素数、类型与字节序。'}, result: '本机得到数据文件；按所选格式解析，不能假定 .dat 就是普通数字文本。'},
    'td-load': {label: '向测试缓冲区导入数据', target: 'tD', eclipse: {path: 'Memory Browser → 视图菜单 → Load Memory', key: '无统一默认键', note: '仅对已预留测试区写入，先保存原始数据。'}, theia: {path: 'Memory → Import data from file', key: '无统一默认键', note: '核对文件格式、目标地址和范围；注意 A53 缓存一致性。'}, result: '指定内存内容改变；刷新后逐项比对。'},
    'te-definition': {label: '追到函数或符号定义', target: 'tE', eclipse: {path: '选中符号 → Navigate → Open Declaration', key: 'F3', note: '可能先到声明；依索引与符号定义位置而定。'}, theia: {path: '符号右键 / Go 菜单 → Go to Definition', key: '【待核对】Keyboard Shortcuts 搜索 Go to Definition', note: '此处不套用 Eclipse 的 F3。'}, result: '编辑器跳到对应定义或展示候选位置。'},
    'te-references': {label: '查找一个函数的引用', target: 'tE', eclipse: {path: '符号右键 → References → Project / Workspace', key: 'Ctrl+Shift+G（工作空间引用）', note: '宏、函数指针和未激活分支仍需全文搜索补查。'}, theia: {path: '符号右键 → Find All References', key: '【待核对】Keyboard Shortcuts 搜索 References', note: '命令名与键位以本机语言服务为准。'}, result: '出现引用位置列表；逐条打开确认真正的调用关系。'},
    'te-back': {label: '回到上一个阅读位置', target: 'tE', eclipse: {path: 'Navigate → Back / Forward', key: 'Alt+← / Alt+→', note: '沿编辑位置历史返回，并非撤销代码。'}, theia: {path: 'Go → Back / Forward', key: '【待核对】Keyboard Shortcuts 搜索 Back / Forward', note: '位置历史与文本撤销是两回事。'}, result: '返回之前的光标位置，便于阅读跨层调用。'},
    'te-outline': {label: '速览当前文件的函数', target: 'tE', eclipse: {path: 'Navigate → Quick Outline', key: 'Ctrl+O', note: '输入符号名过滤当前文件大纲。'}, theia: {path: '右侧 Activity Bar → Outline', key: '【待核对】Keyboard Shortcuts 搜索 Outline', note: 'Theia 右侧大纲与旧版快捷弹窗不是相同布局。'}, result: '展示本文件符号；点击函数跳到对应位置。'},
    'te-file': {label: '快速打开已知文件', target: 'tE', eclipse: {path: 'Navigate → Open Resource...', key: 'Ctrl+Shift+R', note: '按文件名筛选工作空间资源。'}, theia: {path: '【待核对】Go → Go to File...；在本机命令列表搜索 Go to File 核对', key: '【待核对】Keyboard Shortcuts 搜索 Go to File', note: '临时替代：直接在 Explorer 展开工程并打开文件。'}, result: '文件选择结果出现，选中后在编辑器打开。'},
    'te-search': {label: '在工程中全文搜索', target: 'tE', eclipse: {path: 'Search → Search... → File Search', key: 'Ctrl+H', note: 'C/C++ Search 按符号，File Search 按文字。'}, theia: {path: '左侧 Activity Bar → Search', key: '【待核对】Keyboard Shortcuts 搜索 Search', note: '利用包含/排除目录控制搜索范围，避免生成目录噪声。'}, result: '按文件分组显示匹配项，点击跳到源码。'},
    'te-preprocess': {label: '确认宏最终展开成什么', target: 'tE', eclipse: {path: '复制实际编译命令 → 保留原选项 → 使用 -E -dD 输出 .i', key: '无需 IDE 专属快捷键', note: '宏悬停/展开预览取决于编辑器支持，.i 以实际编译器为准。'}, theia: {path: '复制 Output 中编译命令 → 使用 -E -dD 输出 .i', key: '无需 IDE 专属快捷键', note: '保留所有 -I、-D 与目标架构选项，改独立输出文件。'}, result: '得到预处理后的源代码，可核查宏展开和条件分支。'},
    'te-header': {label: '确认真正使用了哪个头文件', target: 'tE', eclipse: {path: '复制实际 GNU 编译命令 → 使用 -E -H', key: '无需 IDE 专属快捷键', note: '保留工程原始 -I、-D 与架构选项。'}, theia: {path: '复制 Output 中 GNU 编译命令 → 使用 -E -H', key: '无需 IDE 专属快捷键', note: '输出的包含层级来自编译器，不仅是编辑器索引。'}, result: '日志列出头文件来源与嵌套关系，帮助定位同名文件混用。'}
  },
  stages: [
    {title: '阶段 1 · 搭好自己的工作桌', duration: '第 1 天 · 2 小时', goal: '认识 Theia 布局，导入工程并能恢复界面。', steps: ['用 Help 查看具体 CCS 小版本，记录板卡 SoC、XDS200 与工具链版本。', '导入完整多工程目录，确认副本/原地导入与链接文件的真实位置。', '按原编码重新打开中文注释文件，再决定是否另存为 UTF-8。', '调整 IDE 字号，找到 Explorer、Output、Problems，并练习恢复布局。'], checks: ['能解释工作空间与工程的区别。', '能找到 Application 的活动配置与依赖工程。', '关掉一个视图后能自行找回。']},
    {title: '阶段 2 · 完成第一次可解释的构建', duration: '第 2—3 天 · 共 4 小时', goal: '编译通过，并用日志、map 与代码导航说明结果。', steps: ['核对 GNU -I、-D、-g、优化与 -march 参数，修复一个可控的缺头文件问题后恢复。', '构建 Application 及依赖库，读出第一条失败命令或成功链接命令。', '生成并阅读 .map，找到 .text 与一个全局数组的放置位置。', '追一次 Application → Driver 调用，找引用后回到原位置。'], checks: ['在已有工具链、SDK和可构建工程前提下，完成15分钟无硬件复盘：导入/编码→路径/构建→map→定义→引用。', 'Theia 用已核对菜单执行导航；Eclipse 对照用 F3、Ctrl+Shift+G。', '能说清三种常见构建错误各该检查哪里。']},
    {title: '阶段 3 · 在正确的核心停下来', duration: '第 4—5 天 · 共 4 小时', goal: '把连接、加载、断点和变量观察串成闭环。', steps: ['按板卡文档建立 .ccxml，选 XDS200 与实际 SoC，运行 Test Connection。', '完成板级初始化，连接指定 A53 核并加载当前 ELF。', '在可执行行停住，单步进入/越过函数并同时看变量、PC和反汇编。', '比较 CPU Reset、Restart、Load Program；在安全练习中测试 Watch 连续刷新支持情况。'], checks: ['能保存完整连接日志并区分 JTAG 通与程序可运行。', '能找到被优化或作用域变化影响的变量，并解释观察限制。', '若无实际硬件，本阶段只完成配置与故障推演，不勾选硬件实测项。']},
    {title: '阶段 4 · 用数据完成一次小诊断', duration: '第 6—7 天 · 共 4 小时', goal: '留下可复查的波形、耗时和内存证据。', steps: ['生成128点已知数组，在 Graph 画出时域曲线，再试可用的 FFT。', '核对 A53 的 Profile Clock 支持；可用则两断点计时，不可用则用 SDK 计时器完成替代实验。', '启用 -fstack-usage，结合调用链与 map 检查一个函数的栈风险。', '导出缓冲区，记录类型、字节序、点数与采样率，写一页复盘。'], checks: ['硬件闭环：.ccxml→Test Connection→Debug断点单步→Watch刷新能力验证→实际可用计时。', '能将 cycles 或 ticks 正确换成微秒，并交代测量条件。', '能用 PC、调用栈和反汇编说明一次异常，不先复位丢掉现场。']}
  ],
  sources: [
    {id: 'topic-project20', title: 'TI CCS 20.5.1 · Creating and Managing Projects', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_project-management.html', scope: 'Theia工作空间、链接资源、构建配置与构建动作。'},
    {id: 'topic-start20', title: 'TI CCS 20.5.1 · Getting Started', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_getting-started.html', scope: '导入与复制选择、新建工程、旧版迁移限制。'},
    {id: 'topic-project12', title: 'TI CCS 12.8 · Creating and Managing Projects', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_12.8.0/ccs_project-management.html', scope: 'Eclipse工作空间和工程管理对照。'},
    {id: 'topic-ldoptions', title: 'GNU ld · Command-line Options', url: 'https://sourceware.org/binutils/docs/ld/Options.html', scope: 'Map输出、链接器选项与gcc驱动的 -Wl, 传参。'},
    {id: 'topic-ldmemory', title: 'GNU ld · MEMORY', url: 'https://sourceware.org/binutils/docs/ld/MEMORY.html', scope: '区域起点、长度、输出段放置与溢出。'},
    {id: 'topic-size', title: 'GNU Binutils · size', url: 'https://sourceware.org/binutils/docs/binutils/size.html', scope: '用 -A 查看各段大小；辅助map分析。'},
    {id: 'topic-debug20', title: 'TI CCS 20.5.1 · Debug Overview', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_debug-main.html', scope: '.ccxml、Watch、Memory、Graph、Clock与目标支持限制。'},
    {id: 'topic-jtag', title: 'TI · Debugging JTAG Connectivity Problems', url: 'https://software-dl.ti.com/ccs/esd/documents/ccs_debugging_jtag_connectivity_issues.html', scope: '底层连接测试与分阶段定位方法。'},
    {id: 'topic-reset', title: 'TI CCS 12.8 · Debug Overview', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_12.8.0/ccs_debug-main.html', scope: 'Eclipse调试操作、重启、复位与加载的对照。'},
    {id: 'topic-armexception', title: 'Arm · Cortex-A53 Technical Reference Manual · DDI0500J', url: 'https://documentation-service.arm.com/static/6040c321ee937942ba301626', scope: 'A53寄存器、异常和调试资源；ID_AA64DFR0_EL1给出6个硬件断点与4个观察点，实际可用数需核对占用。'},
    {id: 'topic-clock', title: 'TI · Counting Cycles', url: 'https://software-dl.ti.com/ccs/esd/documents/ccs_counting_cycles.html', scope: 'Profile Clock、Count Event、计数清零与周期换算。'},
    {id: 'topic-stack', title: 'GCC · Developer Options', url: 'https://gcc.gnu.org/onlinedocs/gcc/Developer-Options.html', scope: '-fstack-usage和每函数栈信息。'},
    {id: 'topic-debug12', title: 'TI CCS 12.8 · Debugging the application', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_12.8.0/ccs_debug-main.html', scope: 'Eclipse Graph与Memory Browser菜单对照。'},
    {id: 'topic-ide20', title: 'TI CCS 20.5.1 · General IDE', url: 'https://software-dl.ti.com/ccs/esd/documents/users_guide_ccs_20.5.1/ccs_ide.html', scope: 'Theia编辑器、Outline、Search、Keyboard Shortcuts和设置作用域。'},
    {id: 'topic-edit12', title: 'TI C2000 Academy · Debugging Tools', url: 'https://software-dl.ti.com/C2000/docs/C2000_MCU_Hands_On_Software_Training/C2000_F28X7X_Labs/debug_lab.html', scope: 'Eclipse源码导航与F3示例；文档的器件操作属于C2000，不直接用于A53。'},
    {id: 'topic-preprocessor', title: 'GCC · Preprocessor Options', url: 'https://gcc.gnu.org/onlinedocs/gcc/Preprocessor-Options.html', scope: '-D、-E、-dD与-H，核对宏及头文件来源。'}
  ]
};
