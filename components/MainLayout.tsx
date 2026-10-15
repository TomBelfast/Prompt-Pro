import React from 'react';

interface MainLayoutProps {
  isHistoryVisible: boolean;
  historyPanel: React.ReactNode;
  inputPanel: React.ReactNode;
  outputPanel: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  isHistoryVisible,
  historyPanel,
  inputPanel,
  outputPanel,
}) => {
  return (
    <main className="flex-grow container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {isHistoryVisible && (
          <aside className="lg:col-span-3 min-h-[400px] lg:h-[calc(100vh-140px)]">
            {historyPanel}
          </aside>
        )}
        <section
          className={`${
            isHistoryVisible ? 'lg:col-span-4' : 'lg:col-span-5'
          } min-h-[500px] lg:h-[calc(100vh-140px)]`}
        >
          {inputPanel}
        </section>
        <section
          className={`${
            isHistoryVisible ? 'lg:col-span-5' : 'lg:col-span-7'
          } min-h-[500px] lg:h-[calc(100vh-140px)]`}
        >
          {outputPanel}
        </section>
      </div>
    </main>
  );
};