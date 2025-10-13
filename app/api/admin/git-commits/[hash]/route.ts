import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

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

interface RouteContext {
  params: Promise<{ hash: string }>
}

/**
 * GET /api/admin/git-commits/[hash]
 * 특정 Git 커밋의 상세 정보 조회
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { hash } = await context.params

    if (!hash) {
      return NextResponse.json({ error: '커밋 해시가 필요합니다.' }, { status: 400 })
    }

    // 1. 커밋 기본 정보 (해시, 작성자, 날짜, 전체 메시지) 조회
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

        // Determine status (A for added, D for deleted, M for modified, R for renamed, C for copied)
        let status = 'M' // Default to modified
        if (ins === '-' && del === '-') {
          status = 'M' // Binary file or other special case
        } else if (isNaN(numIns) && !isNaN(numDel)) {
          status = 'D' // Deleted
        } else if (!isNaN(numIns) && isNaN(numDel)) {
          status = 'A' // Added
        } else if (numIns > 0 || numDel > 0) {
          status = 'M' // Modified
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
  } catch (error) {
    console.error('Failed to fetch Git commit details:', error)
    return NextResponse.json(
      { error: 'Git 커밋 상세 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    )
  }
}
