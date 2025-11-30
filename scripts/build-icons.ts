import { Listr } from 'listr2'
import consola from 'consola'
import { cleanSrc } from './tasks/clean-directories'
import generateIcons from './tasks/generate-icons'
import generateIndex from './tasks/generate-index'
import generateDemo from './tasks/generate-demo'

interface TaskContext {
  startTime: number
}

const tasks = new Listr<TaskContext>(
  [
    {
      title: '🧹 清理目录',
      task: async () => {
        await cleanSrc()
      },
    },
    {
      title: '🎨 生成图标组件',
      task: async () => {
        await generateIcons()
      },
    },
    {
      title: '📦 生成索引和 Demo',
      task: (_, task) =>
        task.newListr(
          [
            {
              title: '生成索引文件',
              task: async () => {
                await generateIndex()
              },
            },
            {
              title: '生成 Demo 页面',
              task: async () => {
                await generateDemo()
              },
            },
          ],
          { concurrent: true },
        ),
    },
  ],
  {
    concurrent: false,
    rendererOptions: {
      collapseSubtasks: false,
    },
  },
)

async function main() {
  const startTime = Date.now()

  try {
    await tasks.run({ startTime })

    const duration = ((Date.now() - startTime) / 1000).toFixed(2)

    consola.success(`\n✨ 构建完成! 耗时 ${duration}s`)
  } catch (error) {
    consola.error('\n❌ 构建失败:', error)
    process.exit(1)
  }
}

main().then(() => {})
