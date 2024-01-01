"use client";
import { CategoryTable } from "@/components/book-manage/category-table";
import CreateCategory from "@/components/book-manage/create-category";
import ImportSheet from "@/components/book-manage/import-sheet";
import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { endPoint } from "@/constants";
import createListCategory from "@/lib/book/createListCategory";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { useSWRConfig } from "swr";

const TableLayout = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const { mutate } = useSWRConfig();

  const router = useRouter();
  const page = searchParams["page"] ?? "1";

  const handleCategoryAdded = (name: string) => {
    mutate(`${endPoint}/v1/categories?page=${page ?? 1}&limit=10`);
  };
  const handleFile = async (reader: FileReader) => {
    let categories: string[] = [];
    const ExcelJS = require("exceljs");
    const wb = new ExcelJS.Workbook();
    reader.onload = () => {
      const buffer = reader.result;
      wb.xlsx.load(buffer).then((workbook: any) => {
        workbook.eachSheet((sheet: any, id: any) => {
          sheet.eachRow((row: any, rowIndex: number) => {
            if (rowIndex > 1) {
              const name = row.getCell(1).value.toString();
              if (name && name != "") {
                categories.push(name);
              }
            }
          });
        });
      });
    };

    console.log(categories);
    const response: Promise<any> = createListCategory({ names: categories });
    const responseData = await response;
    console.log(responseData);
    if (responseData.hasOwnProperty("errorKey")) {
      toast({
        variant: "destructive",
        title: "Có lỗi",
        description: responseData.message,
      });
    } else {
      toast({
        variant: "success",
        title: "Thành công",
        description: "Thêm thể loại thành công",
      });
      handleCategoryAdded("");
    }
  };
  return (
    <div className="col">
      <div className="flex flex-row justify-between items-center">
        <h1>Thể loại</h1>
        <div className="flex gap-4">
          <ImportSheet
            handleFile={handleFile}
            sampleFileLink="/category-sample.xlsx"
          />
          <CreateCategory handleCategoryAdded={handleCategoryAdded}>
            <Button>Thêm thể loại</Button>
          </CreateCategory>
        </div>
      </div>
      <div className="flex flex-row flex-wrap gap-2"></div>
      <div className="mb-4 p-3 sha bg-white shadow-[0_1px_3px_0_rgba(0,0,0,0.2)]">
        <Suspense fallback={<Loading />}>
          <CategoryTable searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
};

export default TableLayout;
