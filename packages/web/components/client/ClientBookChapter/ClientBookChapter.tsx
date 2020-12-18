import React, {
  ReactNode,
  SyntheticEvent,
  useEffect,
  useRef,
  useState
} from 'react';
import { fromEvent } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Button } from '@blueprintjs/core';
import { Schema$Chapter } from '@/typings';
import { GoBackButton } from '@/components/GoBackButton';
import { ButtonPopover } from '@/components/ButtonPopover';
import { ClientHeader } from '@/components/client/ClientLayout';
import {
  gotoChapter,
  withChaptersListDrawer
} from '@/components/client/ChapterListDrawer';
import { ClientPreferences } from '@/components/client/ClientPreferences';
import { useClientPreferencesState } from '@/hooks/useClientPreferences';
import { ClientBookChapterContent } from './ClientBookChapterContent';
import classes from './ClientBookChapter.module.scss';

export interface ClientBookChapterData {
  bookID?: string;
  bookName: string;
  chapterNo: number;
  chapter: Schema$Chapter | null;
}

export interface ClientBookChapterProps extends ClientBookChapterData {}

const ChpaterListButton = withChaptersListDrawer(ButtonPopover);

const getTarget = (chapterNo: number) =>
  document.querySelector<HTMLDivElement>(`#chapter-${chapterNo}`);

export function ClientBookChapter({
  bookID,
  bookName,
  chapter: initialChapter,
  chapterNo: initialChapterNo
}: ClientBookChapterProps) {
  const [chapters, setChapters] = useState([initialChapterNo]);
  const [currentChapter, setCurrentChapter] = useState(initialChapterNo);
  const [data, setData] = useState<Record<number, Schema$Chapter>>(
    initialChapter ? { [initialChapter.number]: initialChapter } : {}
  );
  const scrollerRef = useRef<HTMLDivElement>(null);
  const hasNext = useRef(initialChapter ? initialChapter.hasNext : false);
  const loaded = useRef<Record<string, boolean>>({
    [initialChapterNo]: !!initialChapter
  });

  const {
    autoFetchNextChapter,
    fontSize,
    lineHeight
  } = useClientPreferencesState();

  useEffect(() => {
    const scroller = scrollerRef.current;
    let chapterNo = initialChapterNo;

    if (!scroller) {
      throw new Error(`scroller is not defined`);
    }

    const scrollToTarget = () => {
      const offsetTop = getTarget(initialChapterNo)?.offsetTop;
      if (typeof offsetTop === 'number') {
        scroller.scrollTop = offsetTop - scroller.offsetTop;
      }
    };

    setCurrentChapter(initialChapterNo);

    setChapters(chapters => {
      if (chapters.includes(initialChapterNo)) {
        scrollToTarget();
        return chapters;
      }

      if (initialChapterNo === chapters[0] - 1) {
        setTimeout(scrollToTarget, 0);
        return [initialChapterNo, ...chapters];
      }

      if (initialChapterNo === chapters[chapters.length - 1] + 1) {
        setTimeout(scrollToTarget, 0);
        return [...chapters, initialChapterNo];
      }

      scroller.scrollTop = 0;
      return [initialChapterNo];
    });

    if (bookID) {
      const subscription = fromEvent<SyntheticEvent>(scroller, 'scroll')
        .pipe(
          map(() => scroller.scrollTop),
          distinctUntilChanged(),
          map<number, -1 | 1 | undefined>(scrollTop => {
            const target = getTarget(chapterNo);

            if (target) {
              const pos =
                scrollTop + scroller.offsetHeight + scroller.offsetTop;

              if (
                scrollTop === 0 ||
                pos <=
                  target.offsetTop -
                    (parseFloat(window.getComputedStyle(target).marginTop) || 0)
              ) {
                return -1;
              } else if (pos >= target.offsetTop + target.offsetHeight) {
                return 1;
              }
            }
          }),
          filter((i): i is -1 | 1 => !!i)
        )
        .subscribe(delta => {
          const newChapterNo = chapterNo + delta;

          if (
            delta === 1 &&
            hasNext.current &&
            autoFetchNextChapter &&
            loaded.current[chapterNo]
          ) {
            setChapters(chapters => {
              return chapters.includes(newChapterNo)
                ? chapters
                : [...chapters, newChapterNo];
            });
          }

          const newTarget = getTarget(newChapterNo);

          if (newTarget) {
            chapterNo = newChapterNo;
            setCurrentChapter(chapterNo);
            gotoChapter({ bookName, chapterNo, shallow: true });
          }
        });
      return () => subscription.unsubscribe();
    }
  }, [
    bookID,
    bookName,
    initialChapter,
    initialChapterNo,
    autoFetchNextChapter
  ]);

  const title = `第${currentChapter}章`;
  const header = (
    <ClientHeader
      title={title}
      left={
        <GoBackButton targetPath={['/', '/featured', `/book/${bookName}`]} />
      }
      right={[
        <ClientPreferences key="0" />,
        bookID && (
          <ChpaterListButton
            key="1"
            icon="properties"
            content="章節目錄"
            bookID={bookID}
            bookName={bookName}
            chapterNo={currentChapter}
            minimal
          />
        )
      ]}
    />
  );

  useEffect(() => {
    hasNext.current = data[currentChapter]?.hasNext;
  }, [data, currentChapter]);

  const content: ReactNode[] = [];
  const onLoaded = (chapter: Schema$Chapter) => {
    hasNext.current = chapter.hasNext;
    loaded.current[chapter.number] = true;

    setData(data => ({ ...data, [chapter.number]: chapter }));

    // trigger checking after loaded
    // for small content or large screen
    scrollerRef.current?.dispatchEvent(new Event('scroll'));
  };

  if (bookID) {
    for (const chapterNo of chapters) {
      content.push(
        <div
          key={chapterNo}
          id={`chapter-${chapterNo}`}
          className={classes['content']}
          style={{ fontSize, lineHeight }}
        >
          <ClientBookChapterContent
            bookID={bookID}
            chapterNo={chapterNo}
            onLoaded={onLoaded}
            defaultChapter={data[chapterNo]}
          />
        </div>
      );
    }
  }

  return (
    <>
      {header}
      <div className={classes['chapters']} ref={scrollerRef}>
        {content}
        {!autoFetchNextChapter &&
          hasNext.current &&
          loaded.current[currentChapter] && (
            <div style={{ marginTop: 20, marginBottom: 20 }}>
              <Button
                fill
                text="下一章"
                intent="primary"
                onClick={() => {
                  const nextChpaterNo = currentChapter + 1;
                  setCurrentChapter(nextChpaterNo);
                  setChapters(chapters => [...chapters, nextChpaterNo]);
                }}
              />
            </div>
          )}
      </div>
    </>
  );
}
