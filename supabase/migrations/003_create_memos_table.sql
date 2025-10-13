-- 메모 테이블 생성
CREATE TABLE IF NOT EXISTS public.memos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT memos_content_length CHECK (char_length(content) > 0 AND char_length(content) <= 500)
);

-- 인덱스 생성
CREATE INDEX idx_memos_company_id ON public.memos(company_id);
CREATE INDEX idx_memos_created_at ON public.memos(created_at DESC);

-- RLS 활성화
ALTER TABLE public.memos ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 자신의 회사의 메모만 조회 가능
CREATE POLICY "Users can view their company's memos"
  ON public.memos
  FOR SELECT
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- RLS 정책: 자신의 회사의 메모 생성 가능
CREATE POLICY "Users can create memos for their company"
  ON public.memos
  FOR INSERT
  WITH CHECK (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- RLS 정책: 자신의 회사의 메모 수정 가능
CREATE POLICY "Users can update their company's memos"
  ON public.memos
  FOR UPDATE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- RLS 정책: 자신의 회사의 메모 삭제 가능
CREATE POLICY "Users can delete their company's memos"
  ON public.memos
  FOR DELETE
  USING (
    company_id IN (
      SELECT id FROM public.companies WHERE user_id = auth.uid()
    )
  );

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_memos_updated_at
  BEFORE UPDATE ON public.memos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

