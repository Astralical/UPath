"use client";

import PersonalStatementEditor from "../new/editor";

export default function EditStatementClient({
  statement,
  universities,
}: {
  statement: any;
  universities: { id: string; name: string }[];
}) {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">编辑文书</h1>
        <p className="text-gray-500 mt-1">{statement.title}</p>
      </div>
      <PersonalStatementEditor universities={universities} />
    </div>
  );
}
