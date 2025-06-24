import { NewDiaryForm } from "@/components/new-diary-form";

export default function NewEntryPage() {
  return (
    <div className="flex justify-center items-start w-full">
        <div className="w-full max-w-4xl">
            <NewDiaryForm />
        </div>
    </div>
  )
}
