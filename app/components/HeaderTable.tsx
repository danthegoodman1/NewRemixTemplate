export default function HeaderTable(props: {
  /**
   * Only takes the first 4
   */
  pairs?: {
    header: string
    value: string | number | React.ReactElement
  }[]
}) {
  // Could do this with 2 stacked tables and using border-collapse too
  return (
    <div className="max-w-[540px] gap-0 min-h-[156px] w-full border-[#CECED1] border-[0.5px] rounded-sm grid grid-cols-2 text-base">
      {(props.pairs || []).map((i) => {
        return (
          <div className="flex flex-col shrink-0 grow">
            <div className="border-[0.5px] border-[#CECED1] shrink-0 grow px-8 py-[9px] font-mono text-[#6A6A6B]">
              <p>{i.header}</p>
            </div>
            <div className="border-[0.5px] border-[#CECED1] shrink-0 grow px-8 py-[14px] text-[#090A32] font-mono">
              <p>{i.value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
