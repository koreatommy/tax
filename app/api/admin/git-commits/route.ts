import { NextResponse } from 'next/server'

interface GitCommit {
  hash: string
  date: string
  message: string
  author: string
  shortHash: string
}

interface GitHubCommit {
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
}

/**
 * GET /api/admin/git-commits
 * GitHub API를 사용하여 Git 커밋 현황 조회
 */
export async function GET() {
  try {
    // GitHub 저장소 정보 (환경변수에서 가져오거나 기본값 사용)
    const owner = process.env.GITHUB_OWNER || 'koreatommy'
    const repo = process.env.GITHUB_REPO || 'tax'
    
    // GitHub API 토큰 (선택사항, 토큰이 없으면 공개 저장소만 조회 가능)
    const githubToken = process.env.GITHUB_TOKEN
    
    // GitHub API 헤더 설정
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'tax-admin-dashboard'
    }
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`
    }

    // GitHub API를 사용하여 커밋 목록 조회
    const commitsResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=20`,
      { headers }
    )

    if (!commitsResponse.ok) {
      throw new Error(`GitHub API 오류: ${commitsResponse.status}`)
    }

    const githubCommits: GitHubCommit[] = await commitsResponse.json()

    // 커밋 데이터 변환
    const commits: GitCommit[] = githubCommits.map(commit => ({
      hash: commit.sha,
      date: commit.commit.author.date,
      message: commit.commit.message.split('\n')[0], // 첫 번째 줄만 사용
      author: commit.author?.login || commit.commit.author.name,
      shortHash: commit.sha.substring(0, 7)
    }))

    // GitHub API를 사용하여 브랜치 정보 조회
    const branchResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      { headers }
    )

    let currentBranch = 'main'

    if (branchResponse.ok) {
      const repoData = await branchResponse.json()
      currentBranch = repoData.default_branch || 'main'
    }

    const lastCommit = commits[0]

    return NextResponse.json({
      data: {
        commits,
        gitStatus: {
          hasUncommittedChanges: false, // GitHub에서는 uncommitted changes를 확인할 수 없음
          currentBranch,
          lastCommit: {
            hash: lastCommit?.hash,
            date: lastCommit?.date,
            message: lastCommit?.message
          }
        }
      }
    })
  } catch (error) {
    console.error('GitHub API 조회 오류:', error)
    
    // GitHub API 실패 시 로컬 Git 명령어로 폴백 (로컬 환경에서만 작동)
    try {
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)

      const { stdout } = await execAsync(
        'git log --oneline --pretty=format:"%H|%ad|%s|%an" --date=iso -20',
        { cwd: process.cwd() }
      )

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

      const { stdout: branchOutput } = await execAsync(
        'git branch --show-current',
        { cwd: process.cwd() }
      )

      return NextResponse.json({
        data: {
          commits,
          gitStatus: {
            hasUncommittedChanges: false,
            currentBranch: branchOutput.trim(),
            lastCommit: {
              hash: commits[0]?.hash,
              date: commits[0]?.date,
              message: commits[0]?.message
            }
          }
        }
      })
    } catch (fallbackError) {
      console.error('로컬 Git 명령어도 실패:', fallbackError)
      return NextResponse.json(
        { error: 'Git 정보를 조회할 수 없습니다' },
        { status: 500 }
      )
    }
  }
}
