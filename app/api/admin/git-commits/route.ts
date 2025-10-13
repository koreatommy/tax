import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface GitCommit {
  hash: string
  date: string
  message: string
  author: string
  shortHash: string
}

/**
 * GET /api/admin/git-commits
 * Git 커밋 현황 조회
 */
export async function GET() {
  try {
    // Git 커밋 로그 조회 (최근 20개)
    const { stdout } = await execAsync(
      'git log --oneline --pretty=format:"%H|%ad|%s|%an" --date=iso -20',
      { cwd: process.cwd() }
    )

    // 커밋 파싱
    const commits: GitCommit[] = stdout
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [hash, date, message, author] = line.split('|')
        return {
          hash: hash.trim(),
          date: new Date(date.trim()).toISOString(),
          message: message.trim(),
          author: author.trim(),
          shortHash: hash.substring(0, 7)
        }
      })

    // Git 상태 정보 조회
    const { stdout: statusOutput } = await execAsync(
      'git status --porcelain',
      { cwd: process.cwd() }
    )

    const { stdout: branchOutput } = await execAsync(
      'git branch --show-current',
      { cwd: process.cwd() }
    )

    const { stdout: lastCommitOutput } = await execAsync(
      'git log -1 --pretty=format:"%H|%ad|%s" --date=iso',
      { cwd: process.cwd() }
    )

    const [lastHash, lastDate, lastMessage] = lastCommitOutput.split('|')

    return NextResponse.json({
      data: {
        commits,
        gitStatus: {
          hasUncommittedChanges: statusOutput.trim().length > 0,
          currentBranch: branchOutput.trim(),
          lastCommit: {
            hash: lastHash?.trim(),
            date: lastDate ? new Date(lastDate.trim()).toISOString() : null,
            message: lastMessage?.trim()
          }
        }
      }
    })
  } catch (error) {
    console.error('Git 정보 조회 오류:', error)
    return NextResponse.json(
      { error: 'Git 정보를 조회할 수 없습니다' },
      { status: 500 }
    )
  }
}
