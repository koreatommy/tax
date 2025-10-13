import { NextResponse } from 'next/server'

interface GitCommitDetail {
  hash: string
  shortHash: string
  author: string
  date: string
  fullMessage: string
  filesChanged: number
  insertions: number
  deletions: number
  fileChanges: Array<{
    status: string
    path: string
    insertions?: number
    deletions?: number
  }>
}

interface GitHubCommitDetail {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      date: string
    }
  }
  author?: {
    login: string
  }
  stats: {
    total: number
    additions: number
    deletions: number
  }
  files: Array<{
    filename: string
    status: string
    additions: number
    deletions: number
  }>
}

interface RouteContext {
  params: Promise<{ hash: string }>
}

/**
 * GET /api/admin/git-commits/[hash]
 * GitHub API를 사용하여 특정 Git 커밋의 상세 정보 조회
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { hash } = await context.params

    if (!hash) {
      return NextResponse.json({ error: '커밋 해시가 필요합니다.' }, { status: 400 })
    }

    // GitHub 저장소 정보
    const owner = process.env.GITHUB_OWNER || 'koreatommy'
    const repo = process.env.GITHUB_REPO || 'tax'
    const githubToken = process.env.GITHUB_TOKEN

    // GitHub API 헤더 설정
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'tax-admin-dashboard'
    }

    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }

    // GitHub API를 사용하여 커밋 상세 정보 조회
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits/${hash}`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`GitHub API 오류: ${response.status}`)
    }

    const githubCommit: GitHubCommitDetail = await response.json()

    // 파일 변경 정보 변환
    const fileChanges = githubCommit.files.map(file => {
      let status = file.status
      // GitHub status를 Git status로 변환
      switch (file.status) {
        case 'added':
          status = 'A'
          break
        case 'removed':
          status = 'D'
          break
        case 'modified':
          status = 'M'
          break
        case 'renamed':
          status = 'R'
          break
        case 'copied':
          status = 'C'
          break
        default:
          status = 'M'
      }

      return {
        status,
        path: file.filename,
        insertions: file.additions > 0 ? file.additions : undefined,
        deletions: file.deletions > 0 ? file.deletions : undefined,
      }
    })

    const commitDetail: GitCommitDetail = {
      hash: githubCommit.sha,
      shortHash: githubCommit.sha.substring(0, 7),
      author: githubCommit.author?.login || githubCommit.commit.author.name,
      date: githubCommit.commit.author.date,
      fullMessage: githubCommit.commit.message,
      filesChanged: githubCommit.files.length,
      insertions: githubCommit.stats.additions,
      deletions: githubCommit.stats.deletions,
      fileChanges,
    }

    return NextResponse.json({ data: commitDetail })
  } catch (error) {
    console.error('GitHub API 조회 오류:', error)

    // GitHub API 실패 시 로컬 Git 명령어로 폴백 (로컬 환경에서만 작동)
    try {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)

      const { hash } = await context.params

      // 1. 커밋 기본 정보 조회
      const { stdout: logOutput } = await execAsync(
        `git log -1 --pretty=format:"%H%n%an%n%ad%n%B" --date=iso ${hash}`,
        { cwd: process.cwd() }
      )

      const logLines = logOutput.split('\n')
      const commitHash = logLines[0]
      const author = logLines[1]
      const date = logLines[2]
      const fullMessage = logLines.slice(3).join('\n').trim()

      // 2. 파일 변경 통계 및 목록 조회
      const { stdout: numstatOutput } = await execAsync(
        `git show --numstat --pretty=format:"" ${hash}`,
        { cwd: process.cwd() }
      )

      let filesChanged = 0
      let insertions = 0
      let deletions = 0
      const fileChanges: GitCommitDetail['fileChanges'] = []

      numstatOutput.split('\n').forEach(line => {
        const parts = line.trim().split('\t')
        if (parts.length === 3) {
          const [ins, del, path] = parts
          const numIns = parseInt(ins, 10)
          const numDel = parseInt(del, 10)

          filesChanged++
          insertions += isNaN(numIns) ? 0 : numIns
          deletions += isNaN(numDel) ? 0 : numDel

          let status = 'M'
          if (ins === '-' && del === '-') {
            status = 'M'
          } else if (isNaN(numIns) && !isNaN(numDel)) {
            status = 'D'
          } else if (!isNaN(numIns) && isNaN(numDel)) {
            status = 'A'
          } else if (numIns > 0 || numDel > 0) {
            status = 'M'
          }

          fileChanges.push({
            status,
            path,
            insertions: isNaN(numIns) ? undefined : numIns,
            deletions: isNaN(numDel) ? undefined : numDel,
          })
        }
      })

      const commitDetail: GitCommitDetail = {
        hash: commitHash,
        shortHash: commitHash.substring(0, 7),
        author,
        date: new Date(date).toISOString(),
        fullMessage,
        filesChanged,
        insertions,
        deletions,
        fileChanges,
      }

      return NextResponse.json({ data: commitDetail })
    } catch (fallbackError) {
      console.error('로컬 Git 명령어도 실패:', fallbackError)
      return NextResponse.json(
        { error: 'Git 커밋 상세 정보를 가져오는데 실패했습니다.' },
        { status: 500 }
      )
    }
  }
}
