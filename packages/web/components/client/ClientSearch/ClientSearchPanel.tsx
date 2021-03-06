import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import {
  ClientHeader,
  ClientLeftPanelProps
} from '@/components/client/ClientLayout';
import { ButtonPopover } from '@/components/ButtonPopover';
import { withDesktopHeaderBtn } from '@/components/BlankButton';
import { useSearchResult } from './useSearchResult';
import {
  useForm,
  transoform,
  ClientSearchInput,
  Search
} from './ClientSearchInput';
import { ClientSearchItem } from './ClientSearchItem';
import { ClientSearchNotFound } from './ClientSearchNotFound';
import classes from './ClientSearch.module.scss';

interface Props extends ClientLeftPanelProps {}

const SearchButton = withDesktopHeaderBtn(ButtonPopover);

export function ClientSearchPanel({ onLeave }: Props) {
  const router = useRouter();
  const { asPath, query } = router;
  const [form] = useForm();
  const [search, setSearch] = useState(() =>
    transoform(asPath.startsWith('/search') ? query : {})
  );
  const { state, scrollerRef } = useSearchResult(search);

  const handleSearch = (search: Search) => {
    setSearch(search);
    router.push(
      {
        pathname: '/search',
        query: search.value ? { [search.type]: search.value } : undefined
      },
      undefined,
      { shallow: true }
    );
  };

  const searchButton = (
    <SearchButton minimal icon="cross" content="取消搜索" onClick={onLeave} />
  );

  const items = state.list.map(book => (
    <ClientSearchItem key={book.id} book={book} />
  ));

  const notFound = state.list.length === 0 && search.value?.trim() && (
    <ClientSearchNotFound
      className={classes['not-found']}
      searchType={search.type}
    />
  );

  useEffect(() => {
    form.setFieldsValue(search);
  }, [search, form]);

  useEffect(() => {
    if (asPath.startsWith('/search')) {
      setSearch(search => {
        const newSearch = transoform(query);
        const hasChange =
          search.type !== newSearch.type || search.value !== newSearch.value;
        return hasChange ? newSearch : search;
      });
    }
  }, [asPath, query]);

  return (
    <div className={classes['search']}>
      <ClientHeader title="搜索書籍" left={searchButton} />

      <div className={classes['content']}>
        <ClientSearchInput form={form} onFinish={handleSearch} />

        <div className={classes['books']} ref={scrollerRef}>
          <div className={classes['border']} />
          {items}
        </div>

        {notFound}
      </div>
    </div>
  );
}
